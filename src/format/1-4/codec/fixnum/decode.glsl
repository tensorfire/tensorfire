// https://www.gamedev.net/topic/486847-encoding-16-and-32-bit-floating-point-value-into-rgba-byte-texture/#entry4181050

float @decode1(vec4 rgba) {
    return (dot(rgba * (256.0/255.0), 1.0/vec4(1.0, 255.0, 255.0 * 255.0, 255.0 * 255.0 * 255.0)) - 0.5) * 4096.0;
}