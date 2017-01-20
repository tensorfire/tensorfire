// https://www.gamedev.net/topic/486847-encoding-16-and-32-bit-floating-point-value-into-rgba-byte-texture/#entry4181050



float @decode_float(vec4 v){
	return v.r * 255.0 / 256.0 / 256.0 / 256.0 / 256.0
		+ v.g * 255.0 / 256.0 / 256.0 / 256.0
		+ v.b * 255.0 / 256.0 / 256.0
		+ v.a * 255.0 / 256.0;
}


float @decode1(vec4 rgba) {
	// float f = @decode_float(rgba);
	float f = dot(rgba, vec4(
		255.0 / 256.0 / 256.0 / 256.0 / 256.0,
		255.0 / 256.0 / 256.0 / 256.0,
		255.0 / 256.0 / 256.0,
		255.0 / 256.0
	));
	return (f - 0.5) * 4096.0;
}