// READ_TENSOR_NORMAL

vec4 readTensor(Tensor t, ivec4 pos){
    return texture2D(t.tex, (
        vec2(tile2vec(
            vec2tile(pos.zw, ceildiv(t.shape.z, 4))
        , t.cols) * t.shape.xy) +
        vec2(pos.xy) + vec2(0.5, 0.5)
    ) / vec2(t.texSize));
}

vec4 readTensorX(Tensor t, ivec4 pos){
    return readTensor(t, pos);
}
