uniform ivec2 @texSize;
uniform ivec4 @shape;

vec4 clampify(vec4 v){
    return vec4(ivec4(clamp(v, vec4(0), vec4(1)) * 255.0)) / 255.0;
}

float processf(ivec4 pos);
void main(){
	int tile = vec2tile(ivec2(gl_FragCoord.xy), @texSize.x);
	int chunks = @shape.x * @shape.y * @shape.z * @shape.w;
	if(tile >= chunks){ checkerboard(); return; }

	gl_FragColor = @encode1(@activation44(processf(ivec4(
		imod(tile, @shape.x),
		imod(tile / @shape.x, @shape.y),
		imod(tile / @shape.x / @shape.y, @shape.z ),
		tile / @shape.x / @shape.y / @shape.z
	))));
}