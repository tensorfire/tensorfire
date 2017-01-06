function TensorProgram(shader, out, uniforms){
    KV.Compile(shader, out, uniforms)
    return {
        output: out,
        run(){
            KV.Run(shader, out, uniforms)
        },
        destroy(){
            out.destroy()
            for(let param in uniforms){
                if(uniforms[param] instanceof Tensor){
                    uniforms[param].destroy()
                }
            }
        }
    }
}


function InputLayer(gl, layer, deps, options){
    var tensor = new OutputTensor(gl, options[layer.name]);
    return {
        output: tensor,
        run(options){
            if(options[layer.name]){
                tensor.update(options[layer.name])    
            }
        },
        destroy(){
            tensor.destroy()
        }
    }
}


function ComputeMean(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        const ivec2 tileSize = #(image.shape).xy;

        vec4 process(ivec4 pos) {
            vec4 sum = vec4(0, 0, 0, 0);
            for(int x = 0; x < tileSize.x; x++){
                for(int y = 0; y < tileSize.y; y++){
                    sum += readTensor(image, x, y, pos.z);
                }
            }
            return sum / float(tileSize.x * tileSize.y);
        }
    `
    var inputShape = deps.image.shape;
    var meanTensor = new OutputTensor(gl, [1, 1, inputShape[2]])
    return TensorProgram(SHADER, meanTensor, {
        image: deps.image,
        _activation: layer.activation
    })
}


function Sum(gl, layer, deps){
    const SHADER = `
        uniform Tensor a;
        uniform Tensor b;

        vec4 process(ivec4 pos) {
            return readTensor(a, pos) + readTensor(b, pos);
        }
    `
    if(deps.a.shape.some((k, i) => k != deps.b.shape[i]))
        throw new Error('Mismatched shapes for sum');

    var output = new OutputTensor(gl, deps.a.shape)
    return TensorProgram(SHADER, output, {
        a: deps.a,
        b: deps.b,
        _activation: layer.activation
    })
}

function Activation(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;

        vec4 process(ivec4 pos) {
            return readTensor(image, pos);
        }
    `
    console.assert(['tanh', 'relu'].includes(layer.activation))
    var output = new OutputTensor(gl, deps.image.shape)
    return TensorProgram(SHADER, output, {
        image: deps.image,
        _activation: layer.activation
    })
}



function Deconvolve2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor kernel;

        uniform ivec2 imagePadding;
        uniform ivec2 imageSubsample;

        const int imageTileCount = (#(image.shape).z - 1) / 4 + 1;
        const ivec2 kernelTileSize = #(kernel.shape).xy;

        vec4 process(ivec4 pos){
            vec4 sum = vec4(0, 0, 0, 0);

            for(int f = 0; f < imageTileCount; f++){
                for(int kx = 0; kx < kernelTileSize.x; kx++){
                    int inputX = pos.x + kx - imagePadding.x;
                    if(imod(inputX, 2) != 0 || inputX < 0 || inputX >= int(image.shape.x) * 2) continue;

                    for(int ky = 0; ky < kernelTileSize.y; ky++){
                        int inputY = pos.y + ky - imagePadding.y;
                        if(imod(inputY, 2) != 0 || inputY < 0 || inputY >= int(image.shape.y) * 2) continue;

                        vec4 inputPix = readTensor(image, inputX / 2, inputY / 2, f);

                        sum += inputPix.r * readTensor(kernel, kx, ky, pos.z, 4 * f + 0)
                             + inputPix.g * readTensor(kernel, kx, ky, pos.z, 4 * f + 1)
                             + inputPix.b * readTensor(kernel, kx, ky, pos.z, 4 * f + 2)
                             + inputPix.a * readTensor(kernel, kx, ky, pos.z, 4 * f + 3);
                    }
                }
            }
            return sum;
        }
    `
    var imagePadding = layer.padding;
    var imageSubsample = layer.subsample;
    var inputTensor = deps.image;
    var inputShape = inputTensor.shape;

    var kernelTensor = new Tensor(gl, layer.kernel.transpose(0, 1, 3, 2).step(-1, -1))

    var outputShape = [
        inputShape[0] * imageSubsample[0], 
        inputShape[1] * imageSubsample[1], 
        kernelTensor.shape[2]
    ];

    var output = new OutputTensor(gl, outputShape)
    return TensorProgram(SHADER, output, {
        image: inputTensor,
        kernel: kernelTensor,
        imagePadding: imagePadding,
        imageSubsample: imageSubsample,
        _activation: layer.activation
    })
}

function SquaredResidual(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor mean;

        vec4 process(ivec4 pos){
            vec4 tileMean = readTensor(mean, 0, 0, pos.z);
            vec4 pix = readTensor(image, pos);
            return pow(pix - tileMean, vec4(2, 2, 2, 2));
        }
    `
    console.assert(deps.mean.shape[0] == 1)
    console.assert(deps.mean.shape[1] == 1)
    console.assert(deps.image.shape[2] == deps.mean.shape[2])
    var inputShape = deps.image.shape;
    var residualTensor = new OutputTensor(gl, inputShape)

    return TensorProgram(SHADER, residualTensor, {
        image: deps.image,
        mean: deps.mean,
        _activation: layer.activation
    })
}

function BatchNormalize(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor mean;
        uniform Tensor variance;
        uniform Tensor beta;
        uniform Tensor gamma;

        const float eps = 0.01;

        vec4 process(ivec4 pos) {
            vec4 tileMean = readTensor(mean, 0, 0, pos.z);
            vec4 tileStd = vec4(eps, eps, eps, eps) + sqrt(readTensor(variance, 0, 0, pos.z));
            
            vec4 tileBeta = readTensor(beta, 0, 0, pos.z);
            vec4 tileGamma = readTensor(gamma, 0, 0, pos.z);

            vec4 pix = readTensor(image, pos.xyz);
            return (pix - tileMean) / tileStd * tileGamma + tileBeta;
        }
    `

    var betaTensor = new Tensor(gl, ndarray(layer.beta.data, [1, 1, layer.beta.size]));
    var gammaTensor = new Tensor(gl, ndarray(layer.gamma.data, [1, 1, layer.gamma.size]));

    var inputShape = deps.image.shape;
    var normalizedTensor = new OutputTensor(gl, inputShape)

    return TensorProgram(SHADER, normalizedTensor, { 
        image: deps.image, 
        mean: deps.mean, 
        variance: deps.variance, 

        beta: betaTensor,
        gamma: gammaTensor,
        _activation: layer.activation
    })
}

// based on: https://github.com/transcranial/keras-js/blob/master/src/layers/convolutional/Convolution2D.js

function calcOutputShape(inputShape, kernelShape, subsample = [1, 1], borderMode = 'same') {
    const inputRows = inputShape[0]
    const inputCols = inputShape[1]
    const [nbRow, nbCol, inputChannels, outputChannels] = kernelShape

    const outputRows = borderMode === 'same'
      ? Math.floor((inputRows + subsample[0] - 1) / subsample[0])
      : Math.floor((inputRows - nbRow + subsample[0]) / subsample[0])
    const outputCols = borderMode === 'same'
      ? Math.floor((inputCols + subsample[1] - 1) / subsample[1])
      : Math.floor((inputCols - nbCol + subsample[1]) / subsample[1])

    const paddingRow = borderMode === 'same'
      ? Math.max(0, Math.floor((outputRows - 1) * subsample[0] + nbRow - inputRows))
      : 0
    const paddingCol = borderMode === 'same'
      ? Math.max(0, Math.floor((outputCols - 1) * subsample[1] + nbCol - inputCols))
      : 0
    const paddingRowBefore = Math.floor(paddingRow / 2)
    const paddingRowAfter = paddingRow - paddingRowBefore
    const paddingColBefore = Math.floor(paddingCol / 2)
    const paddingColAfter = paddingCol - paddingColBefore

    return {
        outputShape: [outputRows, outputCols, outputChannels],
        inputPadding: [paddingRowBefore, paddingColBefore]
    }
    // this.inputPadding = [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter]
}

function Convolve2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor kernel;

        uniform ivec2 imagePadding;
        uniform ivec2 imageSubsample;

        const ivec2 kernelTileSize = #(kernel.shape).xy;
        const int imageTileCount = (#(image.shape).z - 1) / 4 + 1;

        vec4 process(ivec4 pos){
            vec4 sum = vec4(0, 0, 0, 0);

            for(int f = 0; f < imageTileCount; f++){
                for(int kx = 0; kx < kernelTileSize.x; kx++){
                    int inputX = pos.x * imageSubsample.x + kx - imagePadding.x;
                    if(inputX < 0 || inputX >= int(image.shape.x)) continue;

                    for(int ky = 0; ky < kernelTileSize.y; ky++){
                        int inputY = pos.y  * imageSubsample.y + ky - imagePadding.y;
                        if(inputY < 0 || inputY >= int(image.shape.y)) continue;

                        vec4 inputPix = readTensor(image, inputX, inputY, f);

                        sum += inputPix.r * readTensor(kernel, kx, ky, pos.z, 4 * f + 0)
                             + inputPix.g * readTensor(kernel, kx, ky, pos.z, 4 * f + 1)
                             + inputPix.b * readTensor(kernel, kx, ky, pos.z, 4 * f + 2)
                             + inputPix.a * readTensor(kernel, kx, ky, pos.z, 4 * f + 3);
                    }
                }
            }
            return sum;
        }
    `
    var imageSubsample = layer.subsample;
    var inputTensor = deps.image;
    var inputShape = inputTensor.shape;
    var kernelTensor = new Tensor(gl, layer.kernel.transpose(0, 1, 3, 2))

    var { inputPadding, outputShape } = calcOutputShape(inputShape, 
        [0, 1, 3, 2].map(k => kernelTensor.shape[k]), imageSubsample)


    var outputTensor = new OutputTensor(gl, outputShape)
    return TensorProgram(SHADER, outputTensor, {
        kernel: kernelTensor,
        image: inputTensor,

        imagePadding: inputPadding,
        imageSubsample: imageSubsample,
        _activation: layer.activation
    })
}

const LAYER_TYPES = {
    InputLayer,
    Convolve2D,
    ComputeMean,
    SquaredResidual,
    BatchNormalize,
    Activation,
    Sum,
    Deconvolve2D
}
