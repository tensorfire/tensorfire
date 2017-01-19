uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;

float @read(ivec4 pos){
    int tile  = pos.x + 
                pos.y * @shape.x + 
                pos.z * @shape.x * @shape.y +
                pos.w * @shape.x * @shape.y * @shape.z;

    return @decode1(texture2D(@tex, 
        (vec2(tile2vec(tile, @texSize.x)) + vec2(0.5, 0.5)) / vec2(@texSize)));
}

// vec4 @read4(ivec4 pos){
//     int z = 4 * (pos.z / 4);
//     return vec4(
//         @readf(ivec4(pos.xy, z    , pos.w)),
//         @readf(ivec4(pos.xy, z + 1, pos.w)),
//         @readf(ivec4(pos.xy, z + 2, pos.w)),
//         @readf(ivec4(pos.xy, z + 3, pos.w))
//     );
// }