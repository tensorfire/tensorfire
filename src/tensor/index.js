import BaseTensor from './base.js';
import showTexture from './show.js'
import runFeatureTests from './feature.js'
import { makeFrameBuffer } from './helpers.js'
import { Run } from '../runtime/index.js'

export class Tensor extends BaseTensor {
    // new Tensor(gl)
    // new Tensor(gl, [1, 1])
    // new Tensor(gl, [1, 1], null)
    // new Tensor(gl, [1, 1], data)
    // new Tensor(gl, [1, 1], data, { type, pack, codec, density })
    // new Tensor(gl, [1, 1], { type, pack, codec, density })
    // new Tensor(gl, [1, 1], 'softfloat')
    // new Tensor(gl, [1, 1], 'float32')
    // new Tensor(gl, [1, 1], 'uint8')
    // new Tensor(gl, { shape, data })
    // new Tensor(gl, { width, height, data })
    // pix = new Tensor(gl, [1, 1, 4], [1, 0.4, 3, 4], 'uint8')

	constructor(gl, shape = [], data = null, format = null){
        super()
        runFeatureTests(gl);

        var xdata = data;
        if(shape.shape){ // ndarrays
            format = data;
            xdata = shape.data;
            data = shape;
            shape = shape.shape;
        }

        if(shape.width && shape.height && shape.data){ // imagedata
            data = shape.data;
            shape = [shape.width, shape.height]
        }

        if(typeof data === 'string'){ // data = uint8 | float32
            if(format !== null)
                throw new Error('Format must not be specified if data is a string.');
            format = data;
            data = null;
        }else if(data && typeof data === 'object' && data.type && data.codec && data.pack && data.density){
            if(format !== null)
                throw new Error('Format must not be specified if data is an object.');
            format = data;
            data = null;
        }

        if(format === null){ // auto-infer format based on data
            if(data === null){
                format = 'float32'
            }else if(xdata instanceof Uint8Array || xdata instanceof Uint8ClampedArray){
                format = 'uint8'
            }else if(xdata instanceof Float32Array || xdata instanceof Float64Array || Array.isArray(xdata)){
                format = 'float32'
            }else throw new Error("Invalid format for data: must be Uint8Array or Float32Array or ndarray");
        }

        var type = null;
        if((format === 'float32' && 
            (gl.NO_FLOAT_TEXTURES || 
            (gl.NO_RENDER_FLOAT && this instanceof OutputTensor)))
            || format === 'softfloat'){
            format = { type: 'uint8', pack: 'stride', density: '1:4', codec: 'softfloat' }
            type = 'float32'
        }else if(format === 'uint8' || format === 'float32'){
            format = { type: format, pack: 'stride', density: '4:4', codec: 'raw' }
        }

        this.type = type || format.type;
        this._init(gl, format, shape, data);
	}


	copy(format = this.type, T = OutputTensor){
        const TENSOR_IDENTITY = `
            uniform Tensor image;
            vec4 process4(ivec4 pos) { return image_read4(pos); }
        `;
        var out = new T(this.gl, this.shape, format);
        out.run(TENSOR_IDENTITY, { image: this })
        return out
    }

    withCopy(fn, ...args){
        var copy = this.copy(...args);
        var result = fn(copy)
        copy.destroy()
        return result;
    }

	_show(opt = {}){ showTexture(this.gl, this.tex, opt) }
    show(opt = {}){
        if(this.format.pack == 'tile' 
            && this.format.density == '4:4' 
            && this.format.codec == 'raw'){
            this._show(opt)
        }else{
            this.withCopy(x => x.show(opt), 
                { type: 'uint8', pack: 'tile', density: '4:4', codec: 'raw' })
        };
    }

    run(shader, params){
        throw new Error('Only OutputTensor can run shaders.')
    }
    read(){
        console.warn("Copying before read...")
        return this.withCopy(x => x.read())
    }
}

export class OutputTensor extends Tensor {
	constructor(...args){
        super(...args);
		this.fbo = makeFrameBuffer(this.gl, this.tex);
	}

    destroy(){
        super.destroy()
        this.gl.deleteFramebuffer(this.fbo)
    }

    _read(){
        var gl = this.gl,
            size = this.info.texSize;

        if(this.format.type == 'uint8'){
            var glType = gl.UNSIGNED_BYTE,
                pixels = new Uint8Array(size[0] * size[1] * 4)
        }else if(this.format.type === 'float32'){
            var glType = gl.FLOAT,
                pixels = new Float32Array(size[0] * size[1] * 4)
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.readPixels(0, 0, size[0], size[1], gl.RGBA, glType, pixels);
        return pixels;
    }

    run(shader, params){
        return Run(shader, this, params);
    }

	read(){
		var array = this._format.pack.unpack(this.info, this._read(), this._format.codec.decode, this.type);
        
        // strip trailing singleton dimensions
        var shape = array.shape.slice(0),
            stride = array.stride.slice(0);
        while(shape[shape.length - 1] == 1){
            shape.pop()
            stride.pop()
        }
        return ndarray(array.data, shape, stride, array.offset);
	}
}

export class InPlaceTensor extends OutputTensor {
	constructor(...args){
		super(...args)

        this.tex2 = this.tex;
        this.tex = makeTexture(gl);
		this.update(null);
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
        var gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
    }
}