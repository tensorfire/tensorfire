import showTexture from './show.js'
import { makeTexture, makeFrameBuffer, checkRenderFloat } from './helpers.js'
import Formats from '../format/index.js'

// The tensor format is a JSON object that specifies how 
// the tensor is represented as a texture
// it consists of several keys:

//     type: uint8 | float32
//     density: 4:4 | 1:4
//     pack: stride | tile
//     codec: 
//			softfloat | fixnum (1:4)
//          raw | linquant (4:4)

export default class BaseTensor {
	constructor(gl, format, shape, data){
		// validate glcontext
		if(!gl.createTexture) throw new Error('Invalid WebGLRenderingContext');
		this.gl = gl;

		// validate shape
        if(shape.some(k => !isFinite(k) || k < 1 || !Number.isInteger(k)) || shape.length > 4) 
            throw new Error('Invalid shape: ' + shape);
        shape = shape.concat([1, 1, 1, 1]).slice(0, 4)
		this.shape = shape;
		
		// validate format
		if(!['float32', 'uint8'].includes(format.type))
			throw new Error('format.type must be uint8 or float32');
		if(!['stride', 'tile'].includes(format.pack))
			throw new Error('format.pack must be stride or tile');
		if(format.density == '4:4'){
			if(!['raw', 'linquant'].includes(format.codec))
				throw new Error('format.codec must be raw or linquant');
		}else if(format.density == '1:4'){
			if(!['softfloat', 'fixnum'].includes(format.codec))
				throw new Error('format.codec must be softfloat or fixnum');
		}else throw new Error('format.density must be 4:4 or 1:4');
		this.format = format;

		// calculate texture size
		this.info = Object.assign({},
			this._format.pack.init(shape, format),
			this._format.codec.init(shape, format)
		);
		if(!this.info.texSize) throw new Error('Format did not yield texSize');

		// initialize texture
		this.tex = makeTexture(gl);
		this.update(data)
	}
	_update(data){
		if(!(this.format.type === 'uint8' || this.format.type === 'float32')) 
			throw new Error('Type must be uint8 or float32');

		var gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 
        	this.info.texSize[0], this.info.texSize[1], 0, gl.RGBA, 
        	this.format.type == 'uint8' ? gl.UNSIGNED_BYTE : gl.FLOAT, data);
	}

	update(data){
		if(!data) return this._update(null);
		this._update(this.format.pack(this.info, data))
	}

	get _format(){
		return {
			pack: Formats[this.format.density].pack[this.format.pack],
			codec: Formats[this.format.density].codec[this.format.codec],
			activations: Formats[this.format.density].activations,
			read_shim: Formats[this.format.density].read_shim,
			write_shim: Formats[this.format.density].write_shim
		}
	}

	_show(opt = {}){ showTexture(this.gl, this.tex, opt) }
    destroy(){ this.gl.deleteTexture(this.tex) }
}