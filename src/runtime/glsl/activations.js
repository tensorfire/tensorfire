export default {
    relu: `
        vec4 activationFunc(vec4 data){
            return max(data, vec4(0, 0, 0, 0))
        }
    `,
    tanh: `
        vec4 activationFunc(vec4 data){
            vec4 e = exp(2.0 * clamp(data, vec4(-10,-10,-10,-10), vec4(-10,-10,-10,-10)) );
            return (e-vec4(1, 1, 1, 1))/(e+vec4(1, 1, 1, 1));
        }
    `,
    sigmoid: `
        vec4 activationFunc(vec4 data){
            return vec4(1, 1, 1, 1) / (vec4(1, 1, 1, 1) + 
                exp(-clamp(data, vec4(-10,-10,-10,-10), vec4(-10,-10,-10,-10))));
        }   
    `,
    hard_sigmoid: `
        vec4 activationFunc(vec4 data){
            return clamp(data * vec4(0.2,0.2,0.2,0.2) + 
                vec4(.5,.5,.5,.5), vec4(0,0,0,0), vec4(1,1,1,1));
        }
    `,
    rgb: `
        vec4 activationFunc(vec4 data){
            return data / 255.0; 
        }
    `
}
