import { readFileSync } from 'fs';

export const encodeShader = readFileSync(__dirname + '/encode.glsl', 'utf8');
export const decodeShader = readFileSync(__dirname + '/decode.glsl', 'utf8');
