import { readFileSync } from 'fs';

export const encodeShader = readFileSync(__dirname + '/encode.glsl', 'utf8');
export const decodeShader = readFileSync(__dirname + '/decode.glsl', 'utf8');

export function init(shape, format){
    return { }
}

export function encode(data, r, g, b, a){
    data[0] = r;
    data[1] = g;
    data[2] = b;
    data[3] = a;
}


export function decode(data, r, g, b, a){
    data[0] = r;
    data[1] = g;
    data[2] = b;
    data[3] = a;
}