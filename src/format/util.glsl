#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

int   imod(int f, int p){ return f - p * (f / p); }
int   vec2tile(ivec2 v, int rows){ return rows * v.y + v.x; }
ivec2 tile2vec(int f, int rows){ return ivec2(imod(f, rows), f / rows); }
int   ceildiv(int a, int b){ return (a - 1) / b + 1; }
void  checkerboard(){ gl_FragColor = vec4(mod(gl_FragCoord.x - gl_FragCoord.y, 2.0), 0.2, 0.1, 1); }

