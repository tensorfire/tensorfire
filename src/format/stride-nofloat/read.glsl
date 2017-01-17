#ifndef DECODE_FLOAT
#define DECODE_FLOAT
// https://github.com/spite/scotlandjs-2015/blob/master/demo/index.html

// This implementation seems to be broken. Logan, you should fix this.
// Look, I called you out by name, in the comments of the source code

float decode_float( vec4 val ) {
    float sign = ( val.a * 255. / pow( 2., 7. ) ) >= 1. ? -1. : 1.;
    float s = val.a * 255.;
    if( s > 128. ) s -= 128.;
    float exponent = s * 2. + floor( val.b * 255. / pow( 2., 7. ) );
    float mantissa = ( val.r * 255. + val.g * 255. * 256. 
            + clamp( val.b * 255. - 128., 0., 255. ) * 256. * 256. );
    float t = val.b * 255.;
    if( t > 128. ) t -= 128.;
    mantissa = t * 256. * 256. + val.g * 255. * 256. + val.r * 255.;
    return sign * pow( 2., exponent - 127. ) * ( 1. + mantissa / pow ( 2., 23. ) );
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

