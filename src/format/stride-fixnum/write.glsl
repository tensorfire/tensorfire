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
// uniform vec4 @decvec;

vec4 process(ivec4 pos);
void main(){
	int shapez = ceildiv(@shape.z, 4);
	int unscaled = vec2tile(ivec2(gl_FragCoord.xy), @texSize.x);
	int tile = unscaled / 4;
	int chunks = @shape.x * @shape.y * shapez * @shape.w;
	if(tile >= chunks){ checkerboard(); return; }

	vec4 value = activationFunc(process(ivec4(
		imod(tile, @shape.x),
		imod(tile / @shape.x, @shape.y),
		imod(tile / @shape.x / @shape.y, shapez ),
		tile / @shape.x / @shape.y / shapez
	)));

	int ch = imod(unscaled, 4);
    if(ch == 0){
        gl_FragColor = encode_fixnum(value.x);
    }else if(ch == 1){
        gl_FragColor = encode_fixnum(value.y);
    }else if(ch == 2){
        gl_FragColor = encode_fixnum(value.z);
    }else if(ch == 3){
        gl_FragColor = encode_fixnum(value.w);
    }
}

// void main(){
// 	int shapez = ceildiv(@shape.z, 4);
// 	int tile = vec2tile(ivec2(gl_FragCoord.x / 4, gl_FragCoord.y), @texSize.x / 4);
// 	int chunks = @shape.x * @shape.y * shapez * @shape.w;
// 	if(tile >= chunks){ checkerboard(); return; }

// 	vec4 value = activationFunc(process(ivec4(
// 		imod(tile, @shape.x),
// 		imod(tile / @shape.x, @shape.y),
// 		imod(tile / @shape.x / @shape.y, shapez ),
// 		tile / @shape.x / @shape.y / shapez
// 	)));


// }
