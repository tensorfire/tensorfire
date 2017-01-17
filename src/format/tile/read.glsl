uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

vec4 @read(ivec4 pos){
    return texture2D(@tex, (
        vec2(tile2vec(
            vec2tile(pos.zw / ivec2(4, 1), ceildiv(@shape.z, 4))
        , @cols) * @shape.xy) +
        vec2(pos.xy) + vec2(0.5, 0.5)
    ) / vec2(@texSize));
}

float @readf(ivec4 pos){ return _readf(@read, pos); }