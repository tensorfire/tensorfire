import { readFileSync } from 'fs';

export const readShader = readFileSync(__dirname + '/read.glsl', 'utf8');
export const writeShader = readFileSync(__dirname + '/write.glsl', 'utf8');

export function init(shape){
    var length = Math.ceil(shape[2] / 4) * shape[3] * shape[1] * shape[0];
    var cols = Math.ceil(Math.sqrt(length));
    var texSize = [cols, Math.ceil(length / cols)]
    return {
    	texSize: texSize,
    	shape: shape,
    	// decvec: [1, shape[0], shape[0] * shape[1], shape[0] * shape[1] * Math.ceil(shape[2] / 4)]
    }
}

export function pack(info, ndarray){
	// return Uint8Array or Float32Array


// uniform sampler2D @_tex;
// uniform ivec2 @_texSize;
// uniform ivec4 @_shape;
// uniform int @_cols;

	// return {
	// 	tex:
	// 	texSize:
	// 	shape:
	// 	cols:
	// }
}


export function unpack(info, arr){
	// return ndarray
}