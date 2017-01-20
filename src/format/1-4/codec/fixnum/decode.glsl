uniform float @range;

float @decode1(vec4 rgba) {
	float f = dot(rgba, vec4(
		255.0 / 256.0 / 256.0 / 256.0 / 256.0,
		255.0 / 256.0 / 256.0 / 256.0,
		255.0 / 256.0 / 256.0,
		255.0 / 256.0
	));
	return (f - 0.5) * @range;
}