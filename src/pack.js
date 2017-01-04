import ndarray from "ndarray"
import ndops from "ndarray-ops"

export function packTensor(array, cols, type = 'float32'){
    array = ndarray(array.data, 
        array.shape.concat([1, 1, 1, 1]).slice(0, 4),
        array.stride.concat([1, 1, 1, 1]).slice(0, 4),
        array.offset)

    var shape = array.shape,
        tiles = Math.ceil(shape[2] / 4) * shape[3],
        tw = shape[0],
        th = shape[1],
        width = tw * cols, 
        height = th * Math.ceil(tiles / cols),
        chunks = Math.ceil(shape[2] / 4),
        length = width * height * 4;
    
    if(type === 'float32'){
        var data = new Float32Array(length);    
    }else if(type === 'uint8'){
        var data = new Uint8Array(length);    
    }

    var out = ndarray(data, [height, width, 4])

    for(var z = 0; z < chunks; z++){
        for(var w = 0; w < shape[3]; w++){
            var tile = w * chunks + z;
            var b = Math.min(z*4+4, shape[2])-z*4;
            var lhs = out
                .hi(th * Math.floor(tile / cols) + th, tw * (tile % cols) + tw,  b)
                .lo(th * Math.floor(tile / cols)     , tw * (tile % cols)     ,  0)
            var rhs = array
                .hi(null, null, 4*z+b, null)
                .lo(null, null, 4*z, null)
                .pick(null, null, null, w)
                .transpose(1, 0, 2)
            ndops.assign(lhs, rhs)
        }
    }
    return data;
}



export function unpackTensor(data, shape, cols){
    var length = shape.reduce((a, b) => a * b)
    var array = ndarray(new Float32Array(length), shape)

    var shape = array.shape,
        tiles = Math.ceil(shape[2] / 4) * shape[3],
        tw = shape[0],
        th = shape[1],
        width = tw * cols, 
        height = th * Math.ceil(tiles / cols),
        chunks = Math.ceil(shape[2] / 4);
    
    var out = ndarray(data, [height, width, 4])

    for(var z = 0; z < chunks; z++){
        for(var w = 0; w < shape[3]; w++){
            var tile = w * chunks + z;
            var b = Math.min(z*4+4, shape[2])-z*4;
            var lhs = out
                .hi(th * Math.floor(tile / cols) + th, tw * (tile % cols) + tw,  b)
                .lo(th * Math.floor(tile / cols)     , tw * (tile % cols)     ,  0)
            var rhs = array
                .hi(null, null, 4*z+b, null)
                .lo(null, null, 4*z, null)
                .pick(null, null, null, w)
                .transpose(1, 0, 2)
            ndops.assign(rhs, lhs)
        }
    }

    return array
}
