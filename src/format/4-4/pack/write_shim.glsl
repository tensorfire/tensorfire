float process(ivec4 pos);
vec4 process4(ivec4 pos){
    return vec4(
        process(ivec4(pos.xy, pos.z    , pos.w)),
        process(ivec4(pos.xy, pos.z + 1, pos.w)),
        process(ivec4(pos.xy, pos.z + 2, pos.w)),
        process(ivec4(pos.xy, pos.z + 3, pos.w))
    );
}