uniform float @range;

vec4 @encode1(float v) {
	float z = clamp(v / @range + 0.5, 0.0, 1.0);

	return mod(z * vec4(
		256.0 * 256.0 * 256.0 * 256.0,
		256.0 * 256.0 * 256.0,
		256.0 * 256.0,
		256.0
	), vec4(256.0)) / 255.0;
}