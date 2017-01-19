// http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/

float @decode14( vec4 rgba ) {
	return (dot( rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/160581375.0) ) - 0.5) * 2048.0;
}
