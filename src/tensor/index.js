import BaseTensor from './base.js';
import { testRenderFloat } from './testing.js'
import { makeFrameBuffer } from './helpers.js'
import * as NormalFormat from '../format/normal/index.js'

export class Tensor extends BaseTensor {
	// constructor(gl, shape = [], data = null, options = {})
	constructor(gl, shape = [], data = null, options = {}){
		// constructor(gl, type, format, shape)
		// less restrictive constructors
		if(!gl.NO_FLOAT_TEXTURES){
            if(!gl.getExtension('OES_texture_float')){
                console.info("This browser does not seem to support OES_texture_float. "
                    + "Using float codec workaround from now on.")
                gl.NO_FLOAT_TEXTURES = true;
            }else if(!gl.RENDER_FLOAT_TESTED && !gl.NO_RENDER_FLOAT){
                if(!testRenderFloat(gl)){
                    console.info("This browser supports OES_texture_float, " + 
                        "but can not render to floating textures. " + 
                        "Using float codec workaround from now on.")
                    gl.NO_RENDER_FLOAT = true;
                }
                gl.RENDER_FLOAT_TESTED = true;
            }
        }

		super(gl, 'float32', NormalFormat, shape);
	}
}

export class OutputTensor extends Tensor {
	constructor(...args){
		super(...args)

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