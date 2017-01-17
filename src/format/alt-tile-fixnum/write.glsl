#ifndef ENCODE_FIXNUM
#define ENCODE_FIXNUM

// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/

vec4 encode_fixnum(float v) {
    vec4 enc = vec4(1.0, 255.0, 65025.0, 160581375.0) * (v / 2048.0 + 0.5);
    enc = fract(enc);
    enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
    return enc;
}
#endif
////////////////////////////////

uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;


float process(ivec4 pos);
void main(){
    int tile = vec2tile(ivec2(gl_FragCoord.xy) / @shape.xy, @cols);
    if(tile >= @shape.z * @shape.w){ checkerboard(); return; }

    gl_FragColor = encode_fixnum(process(ivec4(
        mod(vec2(gl_FragCoord.xy), vec2(@shape.xy)), 
        tile2vec(tile, @shape.z))));
}



