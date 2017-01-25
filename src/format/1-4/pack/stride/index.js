import { readFileSync } from 'fs';

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
    }
}


export function pack(info, array, encode1, format){
    // return Uint8Array or Float32Array
    array = ndarray(array.data, 
        array.shape.concat([1, 1, 1, 1]).slice(0, 4),
        array.stride.concat([1, 1, 1, 1]).slice(0, 4),
        array.offset)

    var shape = info.shape;
    var length = 4 * shape.reduce((a, b) => a * b);


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

                    encode1(data.subarray(4*tile, 4*tile+4), array.get(x, y, z, w))
                }
            }
        }
    }

    console.log(data)

    return data;
}


export function unpack(info, data, decode4, type){
    if(type != 'float32') throw new Error('not impl');

    var shape = info.shape;
    var length = shape.reduce((a, b) => a * b);
    var array = ndarray(new Float32Array(length), shape)


    var [width, height] = info.texSize,
        length = width * height * 4;
    var shape = info.shape;
    var chans = Math.ceil(info.shape[2] / 4);

    var buf = new Float32Array(4);

    for(var i = 0; i < info.shape[0]; i++){
        for(var j = 0; j < info.shape[1]; j++){
            for(var k = 0; k < chans; k++){
                var b = Math.min(k*4+4, shape[2])-k*4;
                for(var w = 0; w < info.shape[3]; w++){

                    var tile  = i + 
                        j * shape[0] + 
                        k * shape[0] * shape[1] +
                        w * shape[0] * shape[1] * chans;

                    decode1(data[4 * tile + 0],
                        data[4 * tile + 1],
                        data[4 * tile + 2],
                        data[4 * tile + 3])


                    for(var x = 0; x < b; x++){
                        array.set(i, j, 4*k+x, w, buf[x])
                    }
                }
            }
        }
    }

    return array;

}