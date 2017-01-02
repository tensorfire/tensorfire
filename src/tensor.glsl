precision highp float;

struct Tensor {
    sampler2D tex;
    ivec2     texSize;
    ivec4     shape; // [width, height, depth/4, batch]
    int       cols;
};

int imod(int f, int p){ return f - p * (f / p); }
int vec2tile(ivec2 v, int rows){ return rows * v.y + v.x; }
ivec2 tile2vec(int f, int rows){ return ivec2(imod(f, rows), f / rows); }
int ceildiv(int a, int b){ return (a - 1) / b + 1; }

vec4 readTensor(Tensor t, ivec4 pos){
    // pos.x, pos.y < shape.x, shape.y
    // pos.z < shape.z / 4
    // pos.w < shape.w

    return texture2D(t.tex, (
        vec2(tile2vec(
            vec2tile(pos.zw, ceildiv(t.shape.z, 4))
        , t.cols) * t.shape.xy) +
        vec2(pos.xy) + vec2(0.5, 0.5)
    ) / vec2(t.texSize));
}

vec4 readTensor(Tensor t, ivec3 pos){ return readTensor(t, ivec4(pos, 0)); }
vec4 readTensor(Tensor t, ivec2 pos){ return readTensor(t, ivec4(pos, 0, 0)); }

vec4 readTensor(Tensor t, int x, int y, int z, int w){ return readTensor(t, ivec4(x, y, z, w)); }
vec4 readTensor(Tensor t, int x, int y, int z){ return readTensor(t, ivec4(x, y, z, 0)); }
vec4 readTensor(Tensor t, int x, int y){ return readTensor(t, ivec4(x, y, 0, 0)); }
vec4 readTensor(Tensor t, int x){ return readTensor(t, ivec4(x, 0, 0, 0)); }

uniform ivec4 _outputShape;
uniform int _outputCols;

vec4 process(ivec4 pos);

void main(){
    int tile = vec2tile(ivec2(gl_FragCoord.xy) / _outputShape.xy, _outputCols);
    int chunks = ceildiv(_outputShape.z, 4);
    if(tile >= chunks * _outputShape.w) return;
    gl_FragColor = process(ivec4(
        mod(gl_FragCoord.xy, vec2(_outputShape.xy)), 
        tile2vec(tile, chunks)));
}