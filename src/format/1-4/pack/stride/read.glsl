uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;

float @read(ivec4 pos){
	float tile = dot(vec4(pos), vec4(1, @shape.x, @shape.x * @shape.y, @shape.x * @shape.y * @shape.z));
	return @decode1(texture2D(@tex, 
		vec2(mod(tile, float(@texSize.x)) + 0.5, floor(tile / float(@texSize.x)) + 0.5) / vec2(@texSize)));
}
