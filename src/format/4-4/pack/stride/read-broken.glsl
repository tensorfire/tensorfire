uniform sampler2D @tex;
uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform vec4 @stride;



vec4 @read4(ivec4 pos){
	float tile = dot(vec4(pos), @stride);
	return @decode4(texture2D(@tex,
		vec2(
			// 0.5 + mod(tile, float(@texSize.x)), 
			// 0.5 + floor(tile / float(@texSize.x))

			0.5 + float(imod(int(tile), @texSize.x)),
			0.5 + float(int(tile) / @texSize.x)



		) / vec2(@texSize.x, @texSize.y)));
}
