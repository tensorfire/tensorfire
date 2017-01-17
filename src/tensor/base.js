import showTexture from './show.js'
import { makeTexture, makeFrameBuffer, checkRenderFloat } from './helpers.js'

export default class BaseTensor {
	constructor(gl, type, format, shape, data){
		// validate glcontext
		if(!gl.createTexture) throw new Error('Invalid WebGLRenderingContext');
		this.gl = gl;

		// validate shape
        if(shape.some(k => !isFinite(k) || k < 1 || !Number.isInteger(k)) || shape.length > 4) 
            throw new Error('Invalid shape: ' + shape);
        shape = shape.concat([1, 1, 1, 1]).slice(0, 4)
		this.shape = shape;
		
		// validate type
		if(!(type === 'uint8' || type === 'float32')) 
			throw new Error('Type must be uint8 or float32');
		this._type = type;

		// validate format
		if(!(format.init && format.pack && format.unpack))
			throw new Error('Format must be object implementing init, pack, unpack');
		this._format = format;

		// calculate texture size
		this._info = this._format.init(shape)
		if(!this._info.texSize) throw new Error('Format did not yield texSize');

		// initialize texture
		this.tex = makeTexture(gl);
		this.update(data)
	}
	_update(data){
		if(!(this._type === 'uint8' || this._type === 'float32')) 
			throw new Error('Type must be uint8 or float32');

		var gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 
        	this._info.texSize[0], this._info.texSize[1], 0, gl.RGBA, 
        	this._type == 'uint8' ? gl.UNSIGNED_BYTE : gl.FLOAT, data);
	}
	update(data){
		if(!data) return this._update(null);
		// this._update(this._format.pack(this._info, data))
	}
	
	_show(opt = {}){ showTexture(this.gl, this.tex, opt) }
    destroy(){ this.gl.deleteTexture(this.tex) }
}