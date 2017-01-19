import showTexture from './show.js'
import { makeTexture, makeFrameBuffer, checkRenderFloat } from './helpers.js'


import * as AltFormat from '../format2/codec/softfloat/index.js'
// import * as NormalFormat from '../format/tile/index.js'
// import * as NofloatFormat from '../format/tile-nofloat/index.js'
// import * as AltFormat from '../format/alt-tile-nofloat/index.js'
// import * as AltFormat from '../format/alt-tile-fixnum/index.js'
// import * as FixnumFormat from '../format/tile-fixnum/index.js'
// import * as StrideFormat from '../format/stride/index.js'
// import * as NofloatFormat from '../format/stride-nofloat/index.js'
// import * as FixnumFormat from '../format/stride-fixnum/index.js'


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
		if(!['raw', 'softfloat', 'fixnum'].includes(format.codec)) 
			throw new Error('format.codec must be stride or tile');

		this.format = format;

		// calculate texture size
		this.info = this.format.init(shape)
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

	get _codec(){
		if(this.format.codec == 'raw'){

		}else if(this.format.codec == 'softfloat'){

		}else if(this.format.codec == 'fixnum'){

		}
	}

	_pack(data){
		var info = this.info;
		if(this.format.pack == 'tile'){

		}else{
			throw new Error('not implemented: ' + this.format.pack)
		}
	}

	_unpack(data){
		var info = this.info;
		if(this.format.pack == 'tile'){

		}else{
			throw new Error('not implemented: ' + this.format.pack)
		}
	}
	
	_show(opt = {}){ showTexture(this.gl, this.tex, opt) }
    destroy(){ this.gl.deleteTexture(this.tex) }
}