import { readFileSync } from 'fs';

export const encodeShader = readFileSync(__dirname + '/encode.glsl', 'utf8');
export const decodeShader = readFileSync(__dirname + '/decode.glsl', 'utf8');

export function init(shape, format){
    return {
        range: format.range || 4096
    }
}

export function encode(buf, value, info){
    var z = Math.min(1, Math.max(0, value / info.range + 0.5));
    buf[0] = (z * 256 * 256 * 256 * 256) % 256
    buf[1] = (z * 256 * 256 * 256) % 256
    buf[2] = (z * 256 * 256) % 256
    buf[3] = (z * 256) % 256
}


export function decode(buf){
    return buf[0] / 256.0 / 256.0 / 256.0 / 256.0 +
           buf[1] / 256.0 / 256.0 / 256.0 +
           buf[2] / 256.0 / 256.0 +
           buf[3] / 256.0;
}
