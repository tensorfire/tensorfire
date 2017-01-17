#ifndef DECODE_FIXNUM
#define DECODE_FIXNUM
// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
float decode_fixnum( vec4 rgba ) {
    return (dot( rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/160581375.0) ) - 0.5) * 2048.0;
}


#endif
////////////////////////////////

uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

float @readf(ivec4 pos){
    return decode_fixnum(texture2D(@tex, (
        vec2(tile2vec(
            vec2tile(pos.zw, @shape.z)
        , @cols) * ivec2(@shape.xy)) +
        vec2(pos.xy) + vec2(0.5, 0.5)
    ) / vec2(@texSize)));
}

vec4 @read(ivec4 pos){
    return vec4(
        @readf(ivec4(pos.xy, pos.z * 4 + 0, pos.w)),
        @readf(ivec4(pos.xy, pos.z * 4 + 1, pos.w)),
        @readf(ivec4(pos.xy, pos.z * 4 + 2, pos.w)),
        @readf(ivec4(pos.xy, pos.z * 4 + 3, pos.w))
    );
}