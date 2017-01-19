uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
// uniform vec4 @decvec;

vec4 @read(ivec4 pos){
	int tile  = pos.x + 
				pos.y * @shape.x + 
				pos.z * @shape.x * @shape.y +
				pos.w * @shape.x * @shape.y * ceildiv(@shape.z, 4);

	// int tile = int(dot(vec4(pos), vec4(1, @shape.x, @shape.x * @shape.y, @shape.x * @shape.y * ceildiv(@shape.z, 4))));
	// int tile = int(dot(vec4(pos), @decvec));
	return texture2D(@tex, (vec2(tile2vec(tile, @texSize.x)) + vec2(0.5, 0.5)) / vec2(@texSize));
}
