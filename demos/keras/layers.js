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
    if(!options[layer.name]) throw new Error("Invalid input");
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
    var meanTensor = new OutputTensor(gl, [1, 1, deps.image.shape[2]])
    return TensorProgram(SHADER, meanTensor, {
        image: deps.image,
        _activation: layer.activation
    })
}

// function SoftmaxHelper(gl, layer, deps){
//     const SHADER = `
//         uniform Tensor image;
//         const channels = (#(image.shape).z - 1) / 4 + 1;

//         vec4 process(ivec4 pos) {
//             float maxVal = vec4(-10000);
//             float sumVal = vec4(0);

//             for(int i = 0; i < channels; i++){
//                 vec4 pix = readTensor(image, 0, 0, i);
//                 maxVal = max(maxVal, pix);
//                 sumVal += pix;
//             }

//             return vec4(
//                 dot(sumVal, vec4(1)) / float(image.shape.z),
//                 max(max(pix.r, pix.g), max(pix.b, pix.a)),
//                 0, 0);
//         }
//     `
//     var softmaxHelper = new OutputTensor(gl, [1])
//     return TensorProgram(SHADER, softmaxHelper, {
//         image: deps.image
//     })
// }


function ExpSum(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        const int channels = (#(image.shape).z - 1) / 4 + 1;

        vec4 process(ivec4 pos) {
            vec4 sumVal = vec4(0);
            for(int i = 0; i < channels; i++){
                sumVal += exp(readTensor(image, 0, 0, i));
            }
            return vec4(dot(sumVal, vec4(1)));
        }
    `
    console.assert(deps.image.shape[0] == 1)
    console.assert(deps.image.shape[1] == 1)
    console.assert(deps.image.shape[3] == 1)
    var softmaxHelper = new OutputTensor(gl, [1, 1, 4])
    return TensorProgram(SHADER, softmaxHelper, {
        image: deps.image
    })
}


function Softmax(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor helper;

        vec4 process(ivec4 pos) {
            return exp(readTensor(image, pos)) / readTensor(helper, 0);
        }
    `
    console.assert(deps.helper.shape[0] == 1)
    console.assert(deps.helper.shape[1] == 1)
    console.assert(deps.helper.shape[2] == 4)
    console.assert(deps.helper.shape[3] == 1)

    var output = new OutputTensor(gl, deps.image.shape)

    return TensorProgram(SHADER, output, {
        image: deps.image,
        helper: deps.helper,
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

function ZeroPadding2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform ivec2 padding;

        vec4 process(ivec4 pos) {
            if(pos.x < padding.x || pos.y < padding.y){
                return vec4(0, 0, 0, 0);
            }else if(pos.x >= image.shape.x + padding.x 
                || pos.y >= image.shape.x + padding.y){
                return vec4(0, 0, 0, 0);
            }else{
                return readTensor(image, ivec4(pos.xy - padding.xy, pos.zw));    
            }
        }
    `
    if(layer.padding.length == 2){
        var padding = [
            layer.padding[0], layer.padding[0], 
            layer.padding[1], layer.padding[1]
        ];
    }else if(layer.padding.length == 4){
        var padding = layer.padding;
    }else{
        throw new Error('invalid padding length')
    }
    var output = new OutputTensor(gl, [
        deps.image.shape[0] + padding[0] + padding[1],
        deps.image.shape[1] + padding[2] + padding[3],
        deps.image.shape[2],
        deps.image.shape[3]])
    return TensorProgram(SHADER, output, {
        image: deps.image,
        padding: layer.padding,
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


function unsqueeze (a, axis) {
    var shape, stride

    if (axis !== undefined && (!Number.isFinite(axis) || (axis % 1 !== axis))) {
        throw new Error('axis of dimension to unsqueeze must be an integer')
    }
    axis = axis === undefined ? a.shape.length : axis

    shape = a.shape.slice(0)
    stride = a.stride.slice(0)
    shape.splice(axis || 0, 0, 1)
    stride.splice(axis || 0, 0, (stride[axis] || 1) * (shape[axis + 1] || 1))

    return ndarray(a.data, shape, stride, a.offset)
}

function ChannelFullyConnected(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        uniform Tensor weights;
        uniform Tensor bias;

        const int imageTileCount = (#(image.shape).z - 1) / 4 + 1;
        vec4 process(ivec4 pos) {
            vec4 sum = readTensor(bias, 0, 0, pos.z, 0);

            for(int f = 0; f < imageTileCount; f++){
                vec4 inputPix = readTensor(image, 0, 0, f);

                sum += inputPix.r * readTensor(weights, 0, 0, pos.z, 4 * f + 0)
                     + inputPix.g * readTensor(weights, 0, 0, pos.z, 4 * f + 1)
                     + inputPix.b * readTensor(weights, 0, 0, pos.z, 4 * f + 2)
                     + inputPix.a * readTensor(weights, 0, 0, pos.z, 4 * f + 3);
            }
            return sum;
        }
    `

    console.assert(deps.image.shape[0] == 1)
    console.assert(deps.image.shape[1] == 1)
    console.assert(deps.image.shape[3] == 1)
    console.assert(deps.image.shape[2] == layer.weights.shape[0])

    var bias = new Tensor(gl, unsqueeze(unsqueeze(layer.bias, 0), 0))


    console.assert(bias.shape[0] == 1)
    console.assert(bias.shape[1] == 1)
    console.assert(bias.shape[2] == layer.weights.shape[1])
        // [ 1, 1, layer.bias ])


    var weights = new Tensor(gl, unsqueeze(unsqueeze(layer.weights.transpose(1, 0), 0), 0))
        // [ 1, 1, layer.weights.shape[1], layer.weights.shape[0] ])

    console.assert(weights.shape[0] == 1)
    console.assert(weights.shape[1] == 1)
    console.assert(weights.shape[2] == layer.weights.shape[1])
    console.assert(weights.shape[3] == layer.weights.shape[0])

    var output = new OutputTensor(gl, [1, 1, layer.weights.shape[1]])

    return TensorProgram(SHADER, output, {
        image: deps.image,
        weights: weights,
        bias: bias,
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
    var kernelTensor = new Tensor(gl, layer.kernel.transpose(0, 1, 3, 2).step(-1, -1))

    var outputShape = [
        deps.image.shape[0] * layer.subsample[0], 
        deps.image.shape[1] * layer.subsample[1], 
        kernelTensor.shape[2]
    ];

    var output = new OutputTensor(gl, outputShape)
    return TensorProgram(SHADER, output, {
        image: deps.image,
        kernel: kernelTensor,
        imagePadding: layer.padding,
        imageSubsample: layer.subsample,
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

    var residualTensor = new OutputTensor(gl, deps.image.shape)

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
    var normalizedTensor = new OutputTensor(gl, deps.image.shape)

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
    console.assert(layer.kernel.shape[2] == deps.image.shape[2])
    var kernelTensor = new Tensor(gl, layer.kernel.transpose(0, 1, 3, 2))
    var { inputPadding, outputShape } = calcOutputShape(deps.image.shape, 
        [0, 1, 3, 2].map(k => kernelTensor.shape[k]), layer.subsample, layer.border_mode)
    var outputTensor = new OutputTensor(gl, outputShape)

    return TensorProgram(SHADER, outputTensor, {
        kernel: kernelTensor,
        image: deps.image,

        imagePadding: inputPadding,
        imageSubsample: layer.subsample,
        _activation: layer.activation
    })
}



function MaxPooling2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        
        uniform ivec2 strides;
        uniform ivec2 padding;

        const ivec2 pool_size = #(_pool_size);

        vec4 process(ivec4 pos){
            vec4 value = vec4(-10000, -10000, -10000, -10000);
            for(int kx = 0; kx < pool_size.x; kx++){
                int inputX = pos.x * strides.x + kx - padding.x;
                if(inputX < 0 || inputX >= int(image.shape.x)) continue;
                for(int ky = 0; ky < pool_size.y; ky++){
                    int inputY = pos.y  * strides.y + ky - padding.y;
                    if(inputY < 0 || inputY >= int(image.shape.y)) continue;
                    value = max(value, readTensor(image, inputX, inputY, pos.z, pos.w));
                }
            }
            return value;
        }
    `


    var { inputPadding, outputShape } = calcOutputShape(deps.image.shape, 
        [ layer.pool_size[0], layer.pool_size[1], -1, deps.image.shape[2]], 
        layer.strides, layer.border_mode)


    var outputTensor = new OutputTensor(gl, outputShape)
    return TensorProgram(SHADER, outputTensor, {
        image: deps.image,

        padding: inputPadding,
        _pool_size: layer.pool_size,
        strides: layer.strides,

        _activation: layer.activation
    })
}



function AveragePooling2D(gl, layer, deps){
    const SHADER = `
        uniform Tensor image;
        
        uniform ivec2 strides;
        uniform ivec2 padding;

        const ivec2 pool_size = #(_pool_size);

        vec4 process(ivec4 pos){
            vec4 value = vec4(0, 0, 0, 0);
            for(int kx = 0; kx < pool_size.x; kx++){
                int inputX = pos.x * strides.x + kx - padding.x;
                if(inputX < 0 || inputX >= int(image.shape.x)) continue;
                for(int ky = 0; ky < pool_size.y; ky++){
                    int inputY = pos.y  * strides.y + ky - padding.y;
                    if(inputY < 0 || inputY >= int(image.shape.y)) continue;
                    value += readTensor(image, inputX, inputY, pos.z, pos.w);
                }
            }
            return value / float(pool_size.x * pool_size.y);
        }
    `


    var { inputPadding, outputShape } = calcOutputShape(deps.image.shape, 
        [ layer.pool_size[0], layer.pool_size[1], -1, deps.image.shape[2]], 
        layer.strides, layer.border_mode)

    var outputTensor = new OutputTensor(gl, outputShape)
    return TensorProgram(SHADER, outputTensor, {
        image: deps.image,

        padding: inputPadding,
        _pool_size: layer.pool_size,
        strides: layer.strides,

        _activation: layer.activation
    })
}


function ConcatChannel(gl, layer, deps){
    const SHADER = `
        uniform Tensor a;
        uniform Tensor b;

        vec4 process(ivec4 pos) {
            if(pos.z < a.shape.z / 4){
                return readTensor(a, pos);
            }else{
                return readTensor(b, ivec4(pos.xy, pos.z - a.shape.z / 4, pos.w));
            }
        }
    `
    // the third channel must be divisible by 4 because
    // of the channel multiplexing stuff

    console.assert(deps.a.shape[2] % 4 == 0)
    console.assert(deps.b.shape[2] % 4 == 0)

    console.assert(deps.a.shape[0] == deps.b.shape[0])
    console.assert(deps.a.shape[1] == deps.b.shape[1])
    console.assert(deps.a.shape[3] == deps.b.shape[3])

    var output = new OutputTensor(gl, [
        deps.a.shape[0], deps.a.shape[1], 
        deps.a.shape[2] + deps.b.shape[2],
        deps.a.shape[3]]);

    return TensorProgram(SHADER, output, {
        a: deps.a,
        b: deps.b,
        _activation: layer.activation
    })
}



const LAYER_TYPES = {
    InputLayer,
    ChannelFullyConnected,
    Convolve2D,
    Sum,
    ComputeMean,
    ExpSum,
    Softmax,
    MaxPooling2D,
    SquaredResidual,
    ZeroPadding2D,
    AveragePooling2D,
    BatchNormalize,
    Activation,
    ConcatChannel,
    Deconvolve2D
}
