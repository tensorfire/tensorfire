import { readFileSync } from 'fs';

export const encodeShader = readFileSync(__dirname + '/encode.glsl', 'utf8');
export const decodeShader = readFileSync(__dirname + '/decode.glsl', 'utf8');

export function init(shape, format){
	return {
		range: [
			isFinite(format.min) ? format.min : 0,
			isFinite(format.max) ? format.max : 1
		]
		// max: ,
		// min: ,
	}
}