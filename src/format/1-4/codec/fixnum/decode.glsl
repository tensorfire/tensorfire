float @decode1( vec4 rgba ) {
    return (dot(rgba, 1.0/vec4(1.0, 255.0, 65025.0, 16581375.0)) - 0.5) * 4096.0;
}