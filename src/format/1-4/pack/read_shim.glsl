vec4 @read4(ivec4 pos){
    int z = 4 * (pos.z / 4);
    return vec4(
        @read(ivec4(pos.xy, z    , pos.w)),
        @read(ivec4(pos.xy, z + 1, pos.w)),
        @read(ivec4(pos.xy, z + 2, pos.w)),
        @read(ivec4(pos.xy, z + 3, pos.w))
    );
}