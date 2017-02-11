uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform vec4 @stride;

vec4 process4(ivec4 pos);
void main(){
	int tile = @texSize.x * int(gl_FragCoord.y) + int(gl_FragCoord.x);
	int shapez = ceildiv(@shape.z, 4);
	if(tile >= int(@stride.w) * @shape.w){ checkerboard(); return; }

	gl_FragColor = @encode4(@activation4(process4(ivec4(
		imod(tile, @shape.x),
		imod(tile / @shape.x, @shape.y),
		4 * imod(tile / @shape.x / @shape.y, shapez),
		tile / @shape.x / @shape.y / shapez
	))));
}
