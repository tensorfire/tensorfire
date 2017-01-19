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

float @readch(ivec4 pos, int ch){
    return decode_fixnum(texture2D(@tex, (
        vec2(tile2vec(
            vec2tile(pos.zw, ceildiv(@shape.z, 4))
        , @cols) * ivec2(@shape.x*4, @shape.y)) +
        vec2(pos.x * 4 + ch, pos.y) + vec2(0.5, 0.5)
    ) / vec2(@texSize)));
}

vec4 @read(ivec4 pos){
    return vec4(@readch(pos, 0), @readch(pos, 1), @readch(pos, 2), @readch(pos, 3));
}
