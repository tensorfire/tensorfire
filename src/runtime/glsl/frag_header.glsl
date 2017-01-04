// TENSOR_FRAGMENT_HEADER

precision highp float;

struct Tensor {
    sampler2D tex;
    ivec2     texSize;
    ivec4     shape; // [width, height, channel+depth, batch]
    int       cols;
};

int   imod(int f, int p){ return f - p * (f / p); }
int   vec2tile(ivec2 v, int rows){ return rows * v.y + v.x; }
ivec2 tile2vec(int f, int rows){ return ivec2(imod(f, rows), f / rows); }
int   ceildiv(int a, int b){ return (a - 1) / b + 1; }

vec4 readTensor(Tensor t, ivec4 pos);
vec4 readTensor(Tensor t, ivec3 pos){ return readTensor(t, ivec4(pos, 0)); }
vec4 readTensor(Tensor t, ivec2 pos){ return readTensor(t, ivec4(pos, 0, 0)); }

vec4 readTensor(Tensor t, int x, int y, int z, int w){ return readTensor(t, ivec4(x, y, z, w)); }
vec4 readTensor(Tensor t, int x, int y, int z){ return readTensor(t, ivec4(x, y, z, 0)); }
vec4 readTensor(Tensor t, int x, int y){ return readTensor(t, ivec4(x, y, 0, 0)); }
vec4 readTensor(Tensor t, int x){ return readTensor(t, ivec4(x, 0, 0, 0)); }

uniform ivec4 _outputShape;
uniform int _outputCols;

vec4 process(ivec4 pos);
void main();
