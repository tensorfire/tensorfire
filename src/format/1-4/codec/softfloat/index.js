import { readFileSync } from 'fs';

export const encodeShader = readFileSync(__dirname + '/encode.glsl', 'utf8');
export const decodeShader = readFileSync(__dirname + '/decode.glsl', 'utf8');

export function init(shape, format){
	return { }
}

var tmp_float = new Float32Array(1),
	tmp_int = new Uint8Array(tmp_float.buffer);

export function encode(buf, value){
	tmp_float[0] = value;
	buf.set(tmp_int, 0)
}