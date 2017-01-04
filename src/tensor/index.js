import showTexture from './show.js'
import { packTensor, unpackTensor } from './pack.js'
import { Run } from '../runtime/index.js'
import ndshow from 'ndarray-show'

//            Tensor: plain old tensors that can be used as inputs
//                    but they can't be used as destinations and 
//                    there isn't a .read() method, so you can't
//                    read the contents of these tensors after
//                    it's been initialized, but you can call
//                    .show() to draw it onto your GL canvas
//                    to see it visually. 
//                    These correspond to textures without an
//                    associated framebuffer object.


export class Tensor {
    constructor(gl, shape = [], data = null, options = {}){
        if(!gl.createTexture)
            throw new Error('Invalid WebGLRenderingContext');
        this.gl = gl;

        if(shape.shape){
            // ndarrays can be passed instead of raw data
            options = data;
            data = shape;
            shape = shape.shape;
        }
        if(shape.width && shape.height && shape.data){
            // imagedata objects can be passed
            options = data;
            shape = [shape.width, shape.height]
            data = shape.data;
        }

        options = options || {};

        shape = shape.concat([1, 1, 1, 1]).slice(0, 4)
        this.shape = shape;

        if(this.shape.some(k => !isFinite(k) || k < 1 || !Number.isInteger(k))) 
            throw new Error('Invalid shape: ' + this.shape);

        // this lets us pass imagedata.data things in
        if(data instanceof Uint8ClampedArray)
            data = new Uint8Array(data);

        if(data === null || data === 'nofloat' || data instanceof Float32Array || data === 'float32'){
            // null defaults to a float32 texture type
            this.type = 'float32'
        }else if(data instanceof Uint8Array || data === 'uint8'){
            this.type = 'uint8'
        }else if(data.shape){
            this.type = 'float32'
        }else if(Array.isArray(data)){
            this.type = 'float32'
            data = new Float32Array(data)
        }else{
            throw new Error("Invalid format for data: must be Uint8Array or Float32Array or ndarray");
        }

        if(!gl.NO_FLOAT_TEXTURES){
            if(!gl.getExtension('OES_texture_float') && !gl.FORCE_FLOAT_TEXTURES){
                console.info("This browser does not seem to support OES_texture_float. "
                    + "Using float codec workaround from now on.")
                gl.NO_FLOAT_TEXTURES = true;
            }
        }

        if(this.type === 'float32' && (gl.NO_FLOAT_TEXTURES || data === 'nofloat' || options.nofloat)){
            this.nofloat = true;
            var width = shape[0] * 4;    
        }else{
            var width = shape[0];
        }

        // we pick the number of columns so we can keep
        // the texture as square as possible, with the
        // minimal amount of wasted space.

        var tiles = Math.ceil(shape[2] / 4) * shape[3],
            cols = Math.max(1, Math.min(tiles, Math.round(
                Math.sqrt(shape[0] * shape[1] * tiles) / width)))
        this.cols = cols;
        this.texSize = [width * cols, shape[1] * Math.ceil(tiles / cols)]

        if(data && data.shape){
            data = packTensor(data, cols, this.type);
        }

        if(typeof data == 'string') data = null;

        if(this.nofloat){
            if(data !== null) data = new Uint8Array(data.buffer);
        }

        if(data !== null){
            let length = this.texSize[0] * this.texSize[1] * 4;
            if(length !== data.length){
                throw new Error("Data array must have length " + length + ", not " + data.length)
            }
        }

        var glType = ({
            float32: gl.FLOAT,
            uint8: gl.UNSIGNED_BYTE
        })[this.nofloat ? 'uint8' : this.type];

        this.tex = makeTexture(gl, this.texSize[0], this.texSize[1], glType, data);
    }
    _show(){ showTexture(this.gl, this.tex) }
    copy(dtype = 'float32'){
        const TENSOR_IDENTITY = `
            uniform Tensor image;

            vec4 process(ivec4 pos) {
                return readTensor(image, pos);
            }
        `
        var out = new OutputTensor(this.gl, this.shape, dtype);
        Run(TENSOR_IDENTITY, out, { image: this })
        return out
    }
    show(){
        if(this.nofloat){
            var out = this.copy('uint8')
            out._show()
            out.destroy()
        }else this._show();
    }
    destroy(){ this.gl.deleteTexture(this.tex) }
}


//      OutputTensor: These are tensors that can be used as 
//                    destinations for tensor operations. 
//                    They also have a .read() method, so you
//                    can go and inspect their values.
//                    Note that you can't write to an OutputTensor
//                    in an operation that uses the same tensor
//                    as an input.
//                    These are implemented as textures with an 
//                    associated framebuffer object.

export class OutputTensor extends Tensor {
    constructor(gl, ...args){
        super(gl, ...args);
        this.fbo = makeFrameBuffer(gl, this.tex);
    }
    destroy(){
        super.destroy()
        this.gl.deleteFramebuffer(this.fbo)
    }

    _read(){
        var gl = this.gl;
        
        if(this.type == 'uint8' || this.nofloat){
            var glType = gl.UNSIGNED_BYTE,
                pixels = new Uint8Array(this.texSize[0] * this.texSize[1] * 4)
        }else{
            var glType = gl.FLOAT,
                pixels = new Float32Array(this.texSize[0] * this.texSize[1] * 4)
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.readPixels(0, 0, this.texSize[0], this.texSize[1], gl.RGBA, glType, pixels);
        return pixels;
    }

    // some browsers (like Safari) don't support readPixels(gl.FLOAT)
    // so we allocate a new tensor with tiles which are 4x as wide

    // so we apply a transformation that encodes the tensor as unsigned bytes first
    _read_nofloat(){
        var out = this.copy('nofloat')
        var data = out.read()
        out.destroy()
        return data;
    }

    read(){
        var gl = this.gl;
        if(this.nofloat){
            var data = new Float32Array(this._read().buffer)
            return unpackTensor(data, this.shape, this.cols)
        }else if(this.type == 'uint8'){
            var pixels = this._read()
            var array = unpackTensor(pixels, this.shape, this.cols)
            for(var i = 0; i < array.data.length; i++){
                array.data[i] /= 255;
            }
            return array;
        }else if(!gl.NO_READ_FLOAT){
            var pixels = this._read()
            if(this.gl.getError() === this.gl.INVALID_ENUM && !gl.FORCE_READ_FLOAT){
                gl.NO_READ_FLOAT = true;
                console.info('This browser does not seem to support readPixels with gl.FLOAT. ' + 
                    'Using float encoder hack from now on.')
            }else{
                return unpackTensor(pixels, this.shape, this.cols)    
            }
        }
        return this._read_nofloat()
    }

    swap(){
        throw new Error("Only InPlaceTensor can be both a parameter and destination.");
    }
    read2(){
        return this.read().pick(null, null, 0, 0)
    }
    print(){
        return ndshow(this.read())
    }
    print2(){
        return ndshow(this.read2())
    }
    
}


//     InPlaceTensor: These are tensors that can do all the things
//                    that Tensor, and OutputTensor can do, but
//                    they can also be used as the destination of
//                    a tensor operation which has it as an input
//                    (this is useful for implementing LSTMs, or
//                    for implementing a weight update step).
//                    These are implemented as a set of two textures
//                    sharing a single framebuffer object that 
//                    get swapped in the middle of in-place operations.

export class InPlaceTensor extends OutputTensor {
    constructor(gl, ...args){
        super(gl, ...args);

        var glType = ({
            float32: gl.FLOAT,
            uint8: gl.UNSIGNED_BYTE
        })[this.type];

        this.tex2 = makeTexture(gl, this.texSize[0], this.texSize[1], glType, null);
    }
    destroy(){
        super.destroy()
        this.gl.deleteTexture(this.tex2)
    }
    swap(){
        var tmp = this.tex;
        this.tex = this.tex2;
        this.tex2 = tmp;

        // TODO: investigate performance of using multiple FBOs instead
        // of rebinding the framebuffer

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
    }
}


function makeFrameBuffer(gl, texture){
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return framebuffer;
}


function makeTexture(gl, width, height, type, data){
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, data);

    return texture;
}

