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

export function pack(info, array, encode4, format){
    // return Uint8Array or Float32Array
    array = ndarray(array.data, 
        array.shape.concat([1, 1, 1, 1]).slice(0, 4),
        array.stride.concat([1, 1, 1, 1]).slice(0, 4),
        array.offset)
    
    var [width, height] = info.texSize,
        length = width * height * 4;
    var shape = info.shape;

    if(format.type === 'float32'){
        var data = new Float32Array(length);    
    }else if(format.type === 'uint8'){
        var data = new Uint8Array(length);    
    }

    var chans = Math.ceil(info.shape[2] / 4);

    for(var i = 0; i < info.shape[0]; i++){
        for(var j = 0; j < info.shape[1]; j++){
            for(var k = 0; k < chans; k++){
                var b = Math.min(k*4+4, shape[2])-k*4;
                for(var w = 0; w < info.shape[3]; w++){

                    var tile  = i + 
                        j * shape[0] + 
                        k * shape[0] * shape[1] +
                        w * shape[0] * shape[1] * chans;


                    var pos = 4 * tile;
                    encode4(
                        data.subarray(pos, pos + 4),
                        b < 1 ? 0 : array.get(i, j, 4*k+0, w), 
                        b < 2 ? 0 : array.get(i, j, 4*k+1, w), 
                        b < 3 ? 0 : array.get(i, j, 4*k+2, w), 
                        b < 4 ? 0 : array.get(i, j, 4*k+3, w))
                }
            }
        }
    }

    console.log(data)
    return data
}


export function unpack(info, arr){
    // return ndarray
}