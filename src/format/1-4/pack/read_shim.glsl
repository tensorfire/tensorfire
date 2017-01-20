vec4 @read4(ivec4 pos){
    int z = 4 * (pos.z / 4);
    
    if(@shape.z - z == 1){
        return vec4(
            @read(ivec4(pos.xy, z    , pos.w)), 
            0,
            0,
            0
        );
    }else if(@shape.z - z == 2){
        return vec4(
            @read(ivec4(pos.xy, z    , pos.w)), 
            @read(ivec4(pos.xy, z + 1, pos.w)),
            0,
            0
        );
    }else if(@shape.z - z == 3){
        return vec4(
            @read(ivec4(pos.xy, z    , pos.w)), 
            @read(ivec4(pos.xy, z + 1, pos.w)),
            @read(ivec4(pos.xy, z + 2, pos.w)),
            0
        );
    }
    
    return vec4(
        @read(ivec4(pos.xy, z    , pos.w)),
        @read(ivec4(pos.xy, z + 1, pos.w)),
        @read(ivec4(pos.xy, z + 2, pos.w)),
        @read(ivec4(pos.xy, z + 3, pos.w))
    );
}