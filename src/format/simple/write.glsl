uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

vec4 process(ivec4 pos);
void main(){
	int tile = dot(gl_FragCoord.xy, ivec2(1, @cols));
	int chunks = @shape.x * @shape.y * @shape.z * @shape.w;
	if(tile >= chunks) return checkerboard();

	gl_FragColor = activationFunc(process(
		imod(tile, @shape.y),
		imod(tile / @shape.y, @shape.z),
		tile / @shape.y / @shape.z
	));
}
