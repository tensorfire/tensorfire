float process(ivec4 pos);
vec4 process4(ivec4 pos){
	int z = 4 * (pos.z / 4);
    return vec4(
        process(ivec4(pos.xy, z    , pos.w)),
        process(ivec4(pos.xy, z + 1, pos.w)),
        process(ivec4(pos.xy, z + 2, pos.w)),
        process(ivec4(pos.xy, z + 3, pos.w))
    );
}