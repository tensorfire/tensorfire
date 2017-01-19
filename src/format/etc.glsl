
vec4 @read4(ivec4 pos){
    int z = 4 * (pos.z / 4);
    return vec4(
        @read(ivec4(pos.xy, z    , pos.w)),
        @read(ivec4(pos.xy, z + 1, pos.w)),
        @read(ivec4(pos.xy, z + 2, pos.w)),
        @read(ivec4(pos.xy, z + 3, pos.w))
    );
}




float @read(ivec4 pos){
    return chsel(@read4(pos), imod(pos.z, 4));
}



vec4 process4(ivec4 pos);
float process(ivec4 pos){
    return chsel(process4(ivec4(pos.xy, 4 * (pos.z / 4), pos.w)), imod(pos.z, 4));
}




float process(ivec4 pos);
vec4 process4(ivec4 pos){
    return vec4(
        process(ivec4(pos.xy, pos.z    , pos.w)),
        process(ivec4(pos.xy, pos.z + 1, pos.w)),
        process(ivec4(pos.xy, pos.z + 2, pos.w)),
        process(ivec4(pos.xy, pos.z + 3, pos.w))
    );
}