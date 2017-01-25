import BaseTensor from './base.js';
import runFeatureTests from './feature.js'
import { makeFrameBuffer } from './helpers.js'
import { Run } from '../runtime/index.js'

export class Tensor extends BaseTensor {
    // new Tensor(gl)
    // new Tensor(gl, [1, 1])
    // new Tensor(gl, [1, 1], null)
    // new Tensor(gl, [1, 1], data)
    // new Tensor(gl, [1, 1], data, { type, pack, codec, density })
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
            format = { type: 'uint8', pack: 'tile', density: '1:4', codec: 'softfloat' }
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
        Run(TENSOR_IDENTITY, out, { image: this })
        return out
    }

    show(opt = {}){
        if(this.format.pack == 'tile' 
            && this.format.density == '4:4' 
            && this.format.codec == 'raw'){
            this._show(opt)   
        }else{
            var out = this.copy('uint8')
            out._show(opt)
            out.destroy()
        };
    }

    read(){
        console.warn('Copying to OutputTensor for reading...')
        return this.copy().read()
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
		// this.gl.readPixels(...)
	}

    run(shader, params){
        return Run(shader, this, params);
    }
	
	read(){
		return this._format.unpack(this._info, this._read())
	}
}

export class InPlaceTensor extends OutputTensor {
	constructor(...args){
		super(...args)
	}
}