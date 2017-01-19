uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

float @read(ivec4 pos){
    return @decode1(texture2D(@tex, (
        vec2(tile2vec(
            vec2tile(pos.zw, @shape.z)
        , @cols) * ivec2(@shape.xy)) +
        vec2(pos.xy) + vec2(0.5, 0.5)
    ) / vec2(@texSize)));
}
