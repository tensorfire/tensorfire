import { readFileSync } from 'fs';
import ndarray from 'ndarray'

export const readShader = readFileSync(__dirname + '/read.glsl', 'utf8');
export const writeShader = readFileSync(__dirname + '/write.glsl', 'utf8');

export function init(shape){
    // var length = 4 * Math.ceil(shape[2] / 4) * shape[3] * shape[1] * shape[0];
    // var cols = Math.ceil(Math.sqrt(length) / 4) * 4;

    var length = shape[2] * shape[3] * shape[1] * shape[0];
    var cols = Math.ceil(Math.sqrt(length));
    var texSize = [cols, Math.ceil(length / cols)]
    return {
        texSize: texSize,
        shape: shape,
        // vec4(1, @shape.x, @shape.x * @shape.y, @shape.x * @shape.y * @shape.z)
        stride: [1, shape[0], shape[0] * shape[1], shape[0] * shape[1] * shape[2]]
    }
}


export function pack(info, array, encode1, format){
    // return Uint8Array or Float32Array
    array = ndarray(array.data, 
        array.shape.concat([1, 1, 1, 1]).slice(0, 4),
        array.stride.concat([1, 1, 1, 1]).slice(0, 4),
        array.offset)

    var shape = info.shape;
    var length = info.texSize[0] * info.texSize[1] * 4;

    if(format.type === 'float32'){
        var data = new Float32Array(length);    
    }else if(format.type === 'uint8'){
        var data = new Uint8Array(length);    
    }

    for(var x = 0; x < shape[0]; x++){
        for(var y = 0; y < shape[1]; y++){
            for(var z = 0; z < shape[2]; z++){
                for(var w = 0; w < shape[3]; w++){
                    var tile  = x + 
                        y * shape[0] + 
                        z * shape[0] * shape[1] +
                        w * shape[0] * shape[1] * shape[2];

                    encode1(data.subarray(4*tile, 4*tile+4), array.get(x, y, z, w), info)
                }
            }
        }
    }

    return data;
}


export function unpack(info, data, decode1, type){
    // if(type != 'float32') throw new Error('not impl');

    var shape = info.shape;
    var length = shape.reduce((a, b) => a * b);

    var array = ndarray(new Float32Array(length), 
        shape.concat([1, 1, 1, 1]).slice(0, 4))


    for(var x = 0; x < shape[0]; x++){
        for(var y = 0; y < shape[1]; y++){
            for(var z = 0; z < shape[2]; z++){
                for(var w = 0; w < shape[3]; w++){
                    var tile  = x + 
                        y * shape[0] + 
                        z * shape[0] * shape[1] +
                        w * shape[0] * shape[1] * shape[2];

                    array.set(x, y, z, w, decode1(data.subarray(4*tile, 4*tile+4), info))
                }
            }
        }
    }
    return array;
}