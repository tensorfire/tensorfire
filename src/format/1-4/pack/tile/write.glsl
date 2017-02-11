uniform ivec2 @texSize;
uniform ivec4 @shape;
uniform int @cols;

// vec4 clampify(vec4 v){
//     return vec4(ivec4(clamp(v, vec4(0), vec4(1)) * 255.0)) / 255.0;
// }

float process(ivec4 pos);
void main(){
    int tile = vec2tile(ivec2(gl_FragCoord.xy) / @shape.xy, @cols);
    if(tile >= @shape.z * @shape.w){ checkerboard(); return; }

    gl_FragColor = @encode1(@activation1(process(ivec4(
        mod(vec2(gl_FragCoord.xy), vec2(@shape.xy)), 
        tile2vec(tile, @shape.z)))));
}