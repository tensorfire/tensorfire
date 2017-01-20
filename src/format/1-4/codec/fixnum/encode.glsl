// https://www.gamedev.net/topic/486847-encoding-16-and-32-bit-floating-point-value-into-rgba-byte-texture/#entry4181050


vec4 @encode_float(float v){
	return vec4(
		mod(v * 256.0 * 256.0 * 256.0 * 256.0, 256.0),
		mod(v * 256.0 * 256.0 * 256.0, 256.0),
		mod(v * 256.0 * 256.0 , 256.0),
		mod(v * 256.0, 256.0)
	) / 255.0;
}



vec4 @encode1(float v) {
	float z = clamp(v / 4096.0 + 0.5, 0.0, 1.0);
	return @encode_float(z);
}