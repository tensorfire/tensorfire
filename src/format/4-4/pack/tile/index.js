import { readFileSync } from 'fs';

export const readShader = readFileSync(__dirname + '/read.glsl', 'utf8');
export const writeShader = readFileSync(__dirname + '/write.glsl', 'utf8');

export function init(shape){
    var width = shape[0]; // var width = shape[0] * 4;    
    // we pick the number of columns so we can keep
    // the texture as square as possible, with the
    // minimal amount of wasted space.

    var tiles = Math.ceil(shape[2] / 4) * shape[3],
        cols = Math.max(1, Math.min(tiles, Math.round(
            Math.sqrt(shape[0] * shape[1] * tiles) / width)));

    var texSize = [width * cols, shape[1] * Math.ceil(tiles / cols)]

    return {
        texSize: texSize,
        cols: cols,
        shape: shape,
    }
}

import ndarray from "ndarray"

export function pack(info, array, encode4, format){
    array = ndarray(array.data, 
        array.shape.concat([1, 1, 1, 1]).slice(0, 4),
        array.stride.concat([1, 1, 1, 1]).slice(0, 4),
        array.offset)

    var shape = array.shape,
        tiles = Math.ceil(shape[2] / 4) * shape[3],
        tw = shape[0],
        th = shape[1],
        cols = info.cols,
        [width, height] = info.texSize,
        chunks = Math.ceil(shape[2] / 4),
        length = width * height * 4;

    if(format.type === 'float32'){
        var data = new Float32Array(length);    
    }else if(format.type === 'uint8'){
        var data = new Uint8Array(length);    
    }
    

    for(var z = 0; z < chunks; z++){
        for(var w = 0; w < shape[3]; w++){
            var tile = w * chunks + z;
            var b = Math.min(z*4+4, shape[2])-z*4;
            
            var ih = th * Math.floor(tile / cols);
            var jw = tw * (tile % cols);

            for(var i = 0; i < tw; i++){
                for(var j = 0; j < th; j++){

                    var pos = 4 * ((ih+j) * width + jw + i);
                    encode4(
                        data.subarray(pos, pos + 4),
                        b < 1 ? 0 : array.get(i, j, 4*z+0, w), 
                        b < 2 ? 0 : array.get(i, j, 4*z+1, w), 
                        b < 3 ? 0 : array.get(i, j, 4*z+2, w), 
                        b < 4 ? 0 : array.get(i, j, 4*z+3, w), info)
                }
            }
        }
    }
    return data;
}

export function unpack(info, data, decode4, type){
    // throw new Error("not implemented: format/4-4/pack/tile/index.js:unpack")

    let shapelength = info.shape.reduce((a, b) => a * b);
    var array = ndarray(new Float32Array(shapelength), info.shape)

    var shape = array.shape,
        tiles = Math.ceil(shape[2] / 4) * shape[3],
        tw = shape[0],
        th = shape[1],
        cols = info.cols,
        [width, height] = info.texSize,
        chunks = Math.ceil(shape[2] / 4),
        length = width * height * 4;

    // if(format.type === 'float32'){
    //     var data = new Float32Array(length);    
    // }else if(format.type === 'uint8'){
    //     var data = new Uint8Array(length);    
    // }
    
    let buf = new Float32Array(4);


    for(var z = 0; z < chunks; z++){
        for(var w = 0; w < shape[3]; w++){
            var tile = w * chunks + z;
            var b = Math.min(z*4+4, shape[2])-z*4;
            
            var ih = th * Math.floor(tile / cols);
            var jw = tw * (tile % cols);

            for(var i = 0; i < tw; i++){
                for(var j = 0; j < th; j++){

                    var pos = 4 * ((ih+j) * width + jw + i);
                    // encode4(
                    //     data.subarray(pos, pos + 4),
                    //     b < 1 ? 0 : array.get(i, j, 4*z+0, w), 
                    //     b < 2 ? 0 : array.get(i, j, 4*z+1, w), 
                    //     b < 3 ? 0 : array.get(i, j, 4*z+2, w), 
                    //     b < 4 ? 0 : array.get(i, j, 4*z+3, w), info)

                    decode4(buf, data[pos], data[pos+1], data[pos+2], data[pos+3], info)
                    
                    if(b >= 1) array.set(i, j, 4*z+0, w, buf[0]);
                    if(b >= 2) array.set(i, j, 4*z+1, w, buf[1]);
                    if(b >= 3) array.set(i, j, 4*z+2, w, buf[2]);
                    if(b >= 4) array.set(i, j, 4*z+3, w, buf[3]);

                }
            }
        }
    }
    return array;
}