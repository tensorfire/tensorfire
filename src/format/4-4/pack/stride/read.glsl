uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;

vec4 @read(ivec4 pos){
	int tile  = pos.x + 
				pos.y * @shape.x + 
				pos.z * @shape.x * @shape.y +
				pos.w * @shape.x * @shape.y * ceildiv(@shape.z, 4);

	return @decode44(texture2D(@tex, 
		(vec2(tile2vec(tile, @texSize.x)) + vec2(0.5, 0.5)) / vec2(@texSize)));
}

float @readf(ivec4 pos){
	return chsel(@read(pos), imod(pos.z, 4));
}