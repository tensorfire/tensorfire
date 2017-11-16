uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;


vec4 @read4(ivec4 pos){
    float tile = float(vec2tile(pos.zw / ivec2(4, 1), ceildiv(@shape.z, 4)));
    return @decode4(texture2D(@tex, (
        vec2(
            mod(tile, float(@cols)),
            floor(tile / float(@cols))
        ) * vec2(@shape.xy) +
        vec2(pos.xy) + vec2(0.5, 0.5)
    ) / vec2(@texSize)));
}
