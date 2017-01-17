#ifndef DECODE_FLOAT
#define DECODE_FLOAT

float decode_float(vec4 val){
    vec4 scl = floor(255.0 * val + 0.5);
    float sgn = (scl.a < 128.0) ? 1.0 : -1.0;
    float exn = mod(scl.a * 2.0, 256.0) + floor(scl.b / 128.0) - 127.0;
    float man = 1.0 +
        (scl.r / 8388608.0) + 
        (scl.g / 32768.0) +
        mod(scl.b, 128.0) / 128.0;
    return sgn * man * pow(2.0, exn);
}

#endif
////////////////////////////////

uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;

float @readch(ivec4 pos, int ch){
	// int tile  = ch +
	// 			pos.x * 4 + 
	// 			pos.y * @shape.x * 4 + 
	// 			pos.z * @shape.x * 4 * @shape.y +
	// 			pos.w * @shape.x * 4 * @shape.y * ceildiv(@shape.z, 4);
	int tile  = 4*(pos.x + 
				pos.y * @shape.x + 
				pos.z * @shape.x * @shape.y +
				pos.w * @shape.x * @shape.y * ceildiv(@shape.z, 4)) + ch;

	return decode_float(texture2D(@tex, (vec2(tile2vec(tile, @texSize.x)) + vec2(0.5, 0.5)) / vec2(@texSize)));
}

vec4 @read(ivec4 pos){
    return vec4(@readch(pos, 0), @readch(pos, 1), @readch(pos, 2), @readch(pos, 3));
}

