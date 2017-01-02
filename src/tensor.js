export class Tensor {
    constructor(gl, shape, data = null){
        if(shape.shape){ // handling new Tensor(gl, ndarray)
            data = shape;
            shape = shape.shape;
        }
        shape = shape.concat([1, 1, 1, 1]).slice(0, 4)
        this.gl = gl;
        this.shape = shape;
        // we pick the number of columns so we can keep
        // the texture as square as possible, with the
        // minimal amount of wasted space.
        var tiles = Math.ceil(shape[2] / 4) * shape[3],
            cols = Math.max(1, Math.min(tiles, Math.round(Math.sqrt(shape[0] * shape[1] * tiles) / shape[0])))
        this.cols = cols;
        this.texSize = [shape[0] * cols, shape[1] * Math.ceil(tiles / cols)]
        if(data && data.shape) data = packTensor(data, cols);
        var type;
        if(data === null || data instanceof Float32Array){
            type = gl.FLOAT;
        }else if(data instanceof Uint8Array){
            type = gl.UNSIGNED_BYTE;
        }else throw new Error("Invalid format for data: must be Uint8Array or Float32Array");

        this.tex = makeTexture(gl, this.texSize[0], this.texSize[1], type, data);
    }
    show(){ ShowTexture(this.gl, this.tex) }
    destroy(){ this.gl.deleteTexture(this.tex) }
}


export class OutputTensor extends Tensor {
    constructor(gl, shape, data = null){
        super(gl, shape, data);
        this.fbo = makeFrameBuffer(gl, this.tex);
    }
    destroy(){
        super.destroy()
        this.gl.deleteFramebuffer(this.fbo)
    }

    _read(dtype = 'float32'){
        this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        var len = this.texSize[0] * this.texSize[1] * 4,
            pixels = (dtype == 'uint8') ? (new Uint8Array(len)) : (new Float32Array(len)),
            glType = (dtype == 'uint8') ? gl.UNSIGNED_BYTE : gl.FLOAT;
        gl.readPixels(0, 0, this.texSize[0], this.texSize[1], gl.RGBA, glType, pixels);
        return pixels;
    }
    read(dtype = 'float32'){
        return unpackTensor(this._read(dtype), this.shape, this.cols)
    }
    // read2(){
    //     return this.read().pick(null, null, 0, 0)
    // }
    // ndshow(){
    //     return ndshow(this.read2())
    // }


    // some browsers (like Safari) don't support readPixels(gl.FLOAT)
    // so we apply a transformation that encodes the tensor as unsigned bytes first
    read_compat(){
        var out = new OutputTensor(gl, 
            [this.shape[0] * 4, this.shape[1], this.shape[2], this.shape[3]])
        TRun(TENSOR_ENCODE_FLOAT, out, { image: this })
        var data = out._read('uint8').buffer;
        out.destroy()
        return unpackTensor(new Float32Array(data), this.shape, this.cols)
    }
}

export class InPlaceTensor extends OutputTensor {
    constructor(gl, shape, data = null){
        super(gl, shape, data);
        this.tex2 = makeTexture(gl, this.texSize[0], this.texSize[1], gl.FLOAT, null);
    }

    swap(){
        var tmp = this.tex;
        this.tex = this.tex2;
        this.tex2 = tmp;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
    }
}
