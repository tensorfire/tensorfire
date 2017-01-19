// https://www.gamedev.net/topic/486847-encoding-16-and-32-bit-floating-point-value-into-rgba-byte-texture/#entry4181050

vec4 @encode1(float v) {
	float z = clamp(v / 4096.0 + 0.5, 0.0, 1.0) * 255.0 / 256.0;
	return fract(vec4(1.0, 255.0, 255.0 * 255.0, 255.0 * 255.0 * 255.0) * z);
}