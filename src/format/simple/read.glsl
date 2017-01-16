uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

vec4 @read(ivec4 pos){
	return texture2D(@tex, (tile2vec(dot(pos, ivec4(
		1,
		@shape.y,
		@shape.y * @shape.z,
		@shape.y * @shape.z * @shape.w,
	)), @cols) + vec2(0.5, 0.5)) / vec2(@size));
}
