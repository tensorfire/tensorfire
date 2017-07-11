uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform vec4 @stride;


float @read(ivec4 pos){
	float tile = dot(vec4(pos), @stride);
	return @decode1(texture2D(@tex, 
		vec2(
			mod(tile, float(@texSize.x)) + 0.5, 
			floor(tile / float(@texSize.x)) + 0.5
		) / vec2(@texSize)));
}
