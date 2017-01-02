// TNSL (pronounced tinsel)
// is a domain specific language based on GLSL
// for helping with the writing code that
// computes with tensors. 

// A limitation of GLSL is that the condition
// of any loop has to be statically known 
// (e.g. counters up to a fixed constant
// value) which is problematic if we want
// to write general code that depends on
// the size of the input tensors

// TNSL adds the following syntax:
//      #(image.shape)
// which will be replaced with an ivec4
// containing the shape of the input tensor "image"
// automatically

export function TNSL(str){
    return function(uniforms){
        return str.replace(/\#\(([\w\.\s]+)\)/g, function(all, body){
            var obj = uniforms;
            for(let part of body.split('.'))
                obj = obj[part.trim()];
            if(typeof obj == 'number'){
                return obj.toString()
            }else if(Array.isArray(obj) && obj.length <= 4 && obj.length > 1){
                return (obj.every(Number.isInteger) ? 'i' : '') + 
                    'vec' + obj.length + '(' + obj.join(',') + ')'
            }
            throw new Error('Can not inline expression ' + body);
        })
        return str;
    }
}
