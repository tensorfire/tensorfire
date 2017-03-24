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

export default function TNSL(str){
    if(typeof str != 'string') 
        throw new Error('TNSL shader preprocessor only accepts strings');
    
    return function(uniforms, output){
        return str
        // comment out the tensor struct definitions
        .replace(/uniform\s*Tensor\s*([\w_]+)\s*;/g, '/* (Tensor $1) */')

        // this is the macro syntax
        .replace(/\#\(([\w\.\s]+)\)/g, function(all, body){
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
        // tensor.read4(x, 0) => tensor.read4(ivec4(x, 0, 0, 0))
        // this transformation takes place when there are 2 or more arguments
        // as otherwise it's not possible to statically determine whether x is
        // of type ivec4 or a number
        .replace(/\b(\w+)\s*\.\s*(read4?)\b\s*\(([^\(\)]+)\)/g, function(all, name, prop, arg){
            if(name in uniforms && uniforms[name].shape){
                var parts = arg.split(','),
                    padded = parts.concat(['0', '0', '0', '0'].slice(0, 4 - parts.length));
                if(parts.length < 2 || parts.length > 4) return all;
                var vec = 'ivec4(' + padded.join(',') + ')';
                return name + '_' + prop + '(' + vec + ')';
            }
            return all;
        })

        // tensor.shape => tensor_shape
        .replace(/\b(\w+)\s*\.\s*(\w+)\b/g, function(all, name, prop){
            if(name in uniforms && uniforms[name].shape){
                return name + '_' + prop;
            }
            return all;
        })
        // .replace(/\#\s*(\w+)\s*\[(.*?)\]/g, function(all, tensor, body){
        //     return tensor + '_read(ivec4(' + body + '))'
        // })
    }
}
