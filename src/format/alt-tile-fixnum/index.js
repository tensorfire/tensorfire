import { readFileSync } from 'fs';

export const readShader = readFileSync(__dirname + '/read.glsl', 'utf8');
export const writeShader = readFileSync(__dirname + '/write.glsl', 'utf8');

export function init(shape){
    var width = shape[0];
    // we pick the number of columns so we can keep
    // the texture as square as possible, with the
    // minimal amount of wasted space.

    var tiles = shape[2] * shape[3],
        cols = Math.max(1, Math.min(tiles, Math.ceil(
            Math.sqrt(shape[0] * shape[1] * tiles) / width)));

    var texSize = [width * cols, shape[1] * Math.ceil(tiles / cols)]

    return {
    	texSize: texSize,
    	cols: cols,
    	shape: shape,
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