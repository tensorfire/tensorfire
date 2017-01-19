vec4 @encode1(float v) {
	return fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * clamp(v / 4096.0 + 0.5, 0.0, 1.0));
}