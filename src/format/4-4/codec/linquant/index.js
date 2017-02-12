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

export function encode(data, r, g, b, a, info){

	data[0] = Math.round(255 * Math.min(1, Math.max(0, (r - info.range[0])/(info.range[1] - info.range[0]) )))
	data[1] = Math.round(255 * Math.min(1, Math.max(0, (g - info.range[0])/(info.range[1] - info.range[0]) )))
	data[2] = Math.round(255 * Math.min(1, Math.max(0, (b - info.range[0])/(info.range[1] - info.range[0]) )))
	data[3] = Math.round(255 * Math.min(1, Math.max(0, (a - info.range[0])/(info.range[1] - info.range[0]) )))
	// console.log(data[0], data[1], data[2])
}


export function decode(data, r, g, b, a, info){
	data[0] = (r / 255) * (info.range[1] - info.range[0]) + info.range[0];
	data[1] = (g / 255) * (info.range[1] - info.range[0]) + info.range[0];
	data[2] = (b / 255) * (info.range[1] - info.range[0]) + info.range[0];
	data[3] = (a / 255) * (info.range[1] - info.range[0]) + info.range[0];
}