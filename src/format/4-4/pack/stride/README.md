Unfortunately, this isn't as fast as the one which uses integer math
12.11 ops/sec ±0.26% (15 runs sampled) 

uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform vec4 @stride;

vec4 process4(ivec4 pos);
void main(){
	float ftile = dot(floor(gl_FragCoord.xy), vec2(1, @texSize.x));
	if(ftile >= @stride.w * float(@shape.w) ){ checkerboard(); return; }

	vec4 tmp = mod(ftile / @stride, vec4(@shape));
	tmp.z = 4.0 * floor(tmp.z / 4.0);
	gl_FragColor = @encode4(@activation4(process4(ivec4(tmp))));
}



This one works kinda okay: 12.10 ops/sec ±0.25% (15 runs sampled)

vec4 tmp = mod(ftile / @stride, vec4(@shape));
gl_FragColor = @encode4(@activation4(process4(ivec4(floor(tmp / vec4(1, 1, 4, 1)) * vec4(1, 1, 4, 1)))));