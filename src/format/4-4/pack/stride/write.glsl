uniform ivec2 @texSize;
uniform ivec4 @shape;

vec4 process4(ivec4 pos);
void main(){
	int shapez = ceildiv(@shape.z, 4);
	int tile = vec2tile(ivec2(gl_FragCoord.xy), @texSize.x);
	int chunks = @shape.x * @shape.y * shapez * @shape.w;
	if(tile >= chunks){ checkerboard(); return; }

	gl_FragColor = @encode4(@activation4(process4(ivec4(
		imod(tile, @shape.x),
		imod(tile / @shape.x, @shape.y),
		imod(tile / @shape.x / @shape.y, shapez ),
		tile / @shape.x / @shape.y / shapez
	))));
}
