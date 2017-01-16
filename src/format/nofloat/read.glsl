uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

float @readch(ivec4 pos, int ch){
    return decode_float(texture2D(@tex, (
        vec2(tile2vec(
            vec2tile(pos.zw, ceildiv(@shape.z, 4))
        , cols) * @shape.xy) +
        vec2(pos.x * 4 + ch, pos.y) + vec2(0.5, 0.5)
    ) / vec2(@size)));
}

vec4 @read(ivec4 pos){
    return vec4(_readch_@(pos, 0), _readch_@(pos, 1), _readch_@(pos, 2), _readch_@(pos, 3));
}