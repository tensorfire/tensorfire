
#ifndef ENCODE_FIXNUM
#define ENCODE_FIXNUM

vec4 encode_fixnum(float v) {
	return fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * clamp(v / 4096.0 + 0.5, 0.0, 1.0));
}

// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/

// vec4 encode_fixnum(float v) {
//     vec4 enc = vec4(1.0, 255.0, 65025.0, 160581375.0) * clamp(v / 2048.0 + 0.5, 0.0, 1.0);
//     enc = fract(enc);
//     enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
//     return enc;
// }
#endif
////////////////////////////////

uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

vec4 clampify(vec4 v){
	return vec4(ivec4(clamp(v, vec4(0), vec4(1)) * 255.0)) / 255.0;
}

float processf(ivec4 pos);
void main(){
    int tile = vec2tile(ivec2(gl_FragCoord.xy) / @shape.xy, @cols);
    if(tile >= @shape.z * @shape.w){ checkerboard(); return; }

    gl_FragColor = clampify(encode_fixnum(processf(ivec4(
        mod(vec2(gl_FragCoord.xy), vec2(@shape.xy)), 
        tile2vec(tile, @shape.z)))));
}




