import BaseTensor from './base.js';
import { testRenderFloat } from './testing.js'
import { makeFrameBuffer } from './helpers.js'

import { Run } from '../runtime/index.js'

export class Tensor extends BaseTensor {
	constructor(gl, shape = [], data = null, ...stuff){
		var options = Object.assign({}, ...stuff);

		if(!gl.NO_FLOAT_TEXTURES){
            if(!gl.getExtension('OES_texture_float')){
                console.info("This browser does not seem to support OES_texture_float. "
                    + "Using float codec workaround from now on.")
                gl.NO_FLOAT_TEXTURES = true;
            }
        }

        if(!gl.NO_FLOAT_TEXTURES){
            if(!gl.RENDER_FLOAT_TESTED && !gl.NO_RENDER_FLOAT){
                if(!testRenderFloat(gl)){
                    console.info("This browser supports OES_texture_float, " + 
                        "but can not render to floating textures. " + 
                        "Using float codec workaround for output tensors from now on.")
                    gl.NO_RENDER_FLOAT = true;
                }
                gl.RENDER_FLOAT_TESTED = true;
            }
        }

        if(shape.shape){
            // ndarrays can be passed instead of raw data
            options = data;
            data = shape;
            shape = shape.shape;
        }
        if(shape.width && shape.height && shape.data){
            // imagedata objects can be passed
            options = data;
            data = shape.data;
            shape = [shape.width, shape.height]
        }

        options = options || {};

        var type;
        if(data === null || data === 'nofloat' || data === 'stride' || data instanceof Float32Array 
            || data === 'float32' || data instanceof Float64Array || Array.isArray(data)){
            // null defaults to a float32 texture type
            type = 'float32'
        }else if(data instanceof Uint8Array || data === 'uint8' || data instanceof Uint8ClampedArray){
            type = 'uint8'
        }else if(data.shape){
            if(data.data instanceof Uint8Array){
                type = 'uint8'
            }else{
                type = 'float32'
            }
        }else{
            throw new Error("Invalid format for data: must be Uint8Array or Float32Array or ndarray");
        }

        
        var nofloat = (type === 'float32' && (
            true || 
            gl.NO_FLOAT_TEXTURES || data === 'nofloat' || options.nofloat
            || (gl.NO_RENDER_FLOAT && options.output) 
        ));

        var stride = options.stride || data === 'stride';

        if(typeof data == 'string') data = null;

        if(nofloat){
            super(gl, { type: 'uint8', pack: 'tile', density: '1:4', codec: 'softfloat' }, shape);
        }else{
        	super(gl, { type, pack: 'tile', density: '4:4', codec: 'raw' }, shape);
        }

        this.type = type;
	}


	copy(dtype = 'float32', constructor = OutputTensor){
        const TENSOR_IDENTITY = `
            uniform Tensor image;
            vec4 process4(ivec4 pos) { return image_read(pos); }
        `;
        var out = new constructor(this.gl, this.shape, dtype);
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
}

export class OutputTensor extends Tensor {
	constructor(gl, shape = [], data = null, ...stuff){
		super(gl, shape, data, ...stuff, { output: true })
		this.fbo = makeFrameBuffer(this.gl, this.tex);
	}

    destroy(){
        super.destroy()
        this.gl.deleteFramebuffer(this.fbo)
    }

	_read(){
		// this.gl.readPixels(...)
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