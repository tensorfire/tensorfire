float process(ivec4 pos);
vec4 process4(ivec4 pos){
    int z = 4 * (pos.z / 4);

    if(@shape.z < 4){
        if(@shape.z == 1){
            return vec4(
                process(ivec4(pos.xy, z    , pos.w)), 
                0,
                0,
                0
            );
        }else if(@shape.z == 2){
            return vec4(
                process(ivec4(pos.xy, z    , pos.w)), 
                process(ivec4(pos.xy, z + 1, pos.w)),
                0,
                0
            );
        }else if(@shape.z == 3){
            return vec4(
                process(ivec4(pos.xy, z    , pos.w)), 
                process(ivec4(pos.xy, z + 1, pos.w)),
                process(ivec4(pos.xy, z + 2, pos.w)),
                0
            );
        }
    }
    
    return vec4(
        process(ivec4(pos.xy, z    , pos.w)),
        process(ivec4(pos.xy, z + 1, pos.w)),
        process(ivec4(pos.xy, z + 2, pos.w)),
        process(ivec4(pos.xy, z + 3, pos.w))
    );
}