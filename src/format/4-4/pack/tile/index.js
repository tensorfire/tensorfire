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
    var out = ndarray(data, [height, width, 4])
    for(var z = 0; z < chunks; z++){
        for(var w = 0; w < shape[3]; w++){
            var tile = w * chunks + z;
            var b = Math.min(z*4+4, shape[2])-z*4;
            
            var ih = th * Math.floor(tile / cols);
            var jw = tw * (tile % cols);

            for(var i = 0; i < th; i++){
                for(var j = 0; j < tw; j++){

                    var pos = 4 * ((ih+i) * width
                            + jw + j);
                    encode4(
                        data.subarray(pos, pos + 4),
                        b < 1 ? 0 : array.get(i, j, 4*z+0, w), 
                        b < 2 ? 0 : array.get(i, j, 4*z+1, w), 
                        b < 3 ? 0 : array.get(i, j, 4*z+2, w), 
                        b < 4 ? 0 : array.get(i, j, 4*z+3, w))
                    // data[4 * ((ih+i) * width + jw + j)] = vec4[0]

                    // for(var k = 0; k < b; k++){
                    //     data[
                    //         4 * ((ih+i) * width
                    //         + jw + j) + k
                    //     ] = array.get(i, j, 4*z+k, w)
                    // }
                }
            }
        }
    }
    console.log(data)
    return data;
}

// import ndops from "ndarray-ops"


// export function pack_old(info, array, codec, format){
// 	// return Uint8Array or Float32Array
//     array = ndarray(array.data, 
//         array.shape.concat([1, 1, 1, 1]).slice(0, 4),
//         array.stride.concat([1, 1, 1, 1]).slice(0, 4),
//         array.offset)

//     var shape = array.shape,
//         tiles = Math.ceil(shape[2] / 4) * shape[3],
//         tw = shape[0],
//         th = shape[1],
//         cols = info.cols,
//         [width, height] = info.texSize,
//         chunks = Math.ceil(shape[2] / 4),
//         length = width * height * 4;

//     if(format.type === 'float32'){
//         var data = new Float32Array(length);    
//     }else if(format.type === 'uint8'){
//         var data = new Uint8Array(length);    
//     }    
//     var out = ndarray(data, [height, width, 4])

//     for(var z = 0; z < chunks; z++){
//         for(var w = 0; w < shape[3]; w++){
//             var tile = w * chunks + z;
//             var b = Math.min(z*4+4, shape[2])-z*4;
//             var lhs = out
//                 .hi(th * Math.floor(tile / cols) + th, tw * (tile % cols) + tw,  b)
//                 .lo(th * Math.floor(tile / cols)     , tw * (tile % cols)     ,  0)
//             var rhs = array
//                 .hi(null, null, 4*z+b, null)
//                 .lo(null, null, 4*z, null)
//                 .pick(null, null, null, w)
//                 .transpose(1, 0, 2)
//             ndops.assign(lhs, rhs)
//         }
//     }

//     console.log(data)
//     return data;
// }


// export function unpack(info, arr){
// 	// return ndarray


// }




// function packTensor(array, cols, type = 'float32'){
//     array = ndarray(array.data, 
//         array.shape.concat([1, 1, 1, 1]).slice(0, 4),
//         array.stride.concat([1, 1, 1, 1]).slice(0, 4),
//         array.offset)

//     var shape = array.shape,
//         tiles = Math.ceil(shape[2] / 4) * shape[3],
//         tw = shape[0],
//         th = shape[1],
//         width = tw * cols, 
//         height = th * Math.ceil(tiles / cols),
//         chunks = Math.ceil(shape[2] / 4),
//         length = width * height * 4;
    
//     if(type === 'float32'){
//         var data = new Float32Array(length);    
//     }else if(type === 'uint8'){
//         var data = new Uint8Array(length);    
//     }

//     var out = ndarray(data, [height, width, 4])

//     for(var z = 0; z < chunks; z++){
//         for(var w = 0; w < shape[3]; w++){
//             var tile = w * chunks + z;
//             var b = Math.min(z*4+4, shape[2])-z*4;
//             var lhs = out
//                 .hi(th * Math.floor(tile / cols) + th, tw * (tile % cols) + tw,  b)
//                 .lo(th * Math.floor(tile / cols)     , tw * (tile % cols)     ,  0)
//             var rhs = array
//                 .hi(null, null, 4*z+b, null)
//                 .lo(null, null, 4*z, null)
//                 .pick(null, null, null, w)
//                 .transpose(1, 0, 2)
//             ndops.assign(lhs, rhs)
//         }
//     }
//     return data;
// }



// function unpackTensor(data, shape, cols){
//     var length = shape.reduce((a, b) => a * b)
//     var array = ndarray(new Float32Array(length), shape)

//     var shape = array.shape,
//         tiles = Math.ceil(shape[2] / 4) * shape[3],
//         tw = shape[0],
//         th = shape[1],
//         width = tw * cols, 
//         height = th * Math.ceil(tiles / cols),
//         chunks = Math.ceil(shape[2] / 4);
    
//     var out = ndarray(data, [height, width, 4])

//     for(var z = 0; z < chunks; z++){
//         for(var w = 0; w < shape[3]; w++){
//             var tile = w * chunks + z;
//             var b = Math.min(z*4+4, shape[2])-z*4;
//             var lhs = out
//                 .hi(th * Math.floor(tile / cols) + th, tw * (tile % cols) + tw,  b)
//                 .lo(th * Math.floor(tile / cols)     , tw * (tile % cols)     ,  0)
//             var rhs = array
//                 .hi(null, null, 4*z+b, null)
//                 .lo(null, null, 4*z, null)
//                 .pick(null, null, null, w)
//                 .transpose(1, 0, 2)
//             ndops.assign(rhs, lhs)
//         }
//     }

//     return array
// }

