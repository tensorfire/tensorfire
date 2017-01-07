// READ_TENSOR_NOFLOAT

float readTensorChannel(Tensor t, ivec4 pos, int ch){
    return decode_float(texture2D(t.tex, (
        vec2(tile2vec(
            vec2tile(pos.zw, ceildiv(t.shape.z, 4))
        , t.cols) * t.shape.xy) +
        vec2(pos.x * 4 + ch, pos.y) + vec2(0.5, 0.5)
    ) / vec2(t.texSize)));
}

vec4 _readTensorChannel(Tensor t, ivec4 pos, int ch){
    float value = readTensorChannel(t, pos, ch);
    if(ch == 0){
        return vec4(value, 0, 0, 0);
    }else if(ch == 1){
        return vec4(0, value, 0, 0);
    }else if(ch == 2){
        return vec4(0, 0, value, 0);
    }else if(ch == 3){
        return vec4(0, 0, 0, value);
    }
}

vec4 readTensor(Tensor t, ivec4 pos){
    return _readTensorChannel(t, pos, 0) +
         + _readTensorChannel(t, pos, 1)
         + _readTensorChannel(t, pos, 2)
         + _readTensorChannel(t, pos, 3);
}

vec4 readTensorX(Tensor t, ivec4 pos){
    int ch = imod(int(gl_FragCoord.x), 4);
    return _readTensorChannel(t, pos, ch);
}
