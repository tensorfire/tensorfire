uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

float @readf(ivec4 pos){
    return decode_float(texture2D(@tex, (
        vec2(tile2vec(
            vec2tile(pos.zw, @shape.z)
        , @cols) * ivec2(@shape.xy)) +
        vec2(pos.xy) + vec2(0.5, 0.5)
    ) / vec2(@texSize)));
}

vec4 @read(ivec4 pos){
    int z = 4 * (pos.z / 4);
    return vec4(
        @readf(ivec4(pos.xy, z    , pos.w)),
        @readf(ivec4(pos.xy, z + 1, pos.w)),
        @readf(ivec4(pos.xy, z + 2, pos.w)),
        @readf(ivec4(pos.xy, z + 3, pos.w))
    );
}
