import { checkLinkError, checkShaderError } from './check.js'

const TENSOR_VERTEX_SHADER = `
    // TENSOR_VERTEX_SHADER

    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
    }
`

// for the purposes of setUniform, we pretend tex is an int
const TENSOR_FIELDS = { 'tex': 'int', 'texSize': 'ivec2', 'shape': 'ivec4', 'cols': 'int' }


const UNIFORM_SETTERS = { vec4: '4fv', vec3: '3fv', vec2: '2fv', float: '1f',
                          ivec4: '4iv', ivec3: '3iv', ivec2: '2iv', int: '1i' };

export default function getTensorProgram(gl, fragmentShader){
    if(!gl._tensorPrograms) gl._tensorPrograms = {};
    if(fragmentShader in gl._tensorPrograms){
        return gl._tensorPrograms[fragmentShader]
    }
    var program = createTensorProgram(gl, fragmentShader);
    gl._tensorPrograms[fragmentShader] = program;
    return program;
}

function createTensorProgram(gl, fragmentShader){
    var program = createShaderProgram(gl, TENSOR_VERTEX_SHADER, fragmentShader);
    
    gl.useProgram(program);
    bindAttributeBuffer(gl, program);

    var uniformTypes = extractUniformDeclarations(fragmentShader),
        uniformLocs = {};

    function addUniform(name, type){
        uniformLocs[name] = { loc: gl.getUniformLocation(program, name), type: type }
    }

    for(let name in uniformTypes){
        let type = uniformTypes[name];
        if(type == 'Tensor'){
            for(let field in TENSOR_FIELDS)
                addUniform(name + '.' + field, TENSOR_FIELDS[field]);
        }else if((type) in UNIFORM_SETTERS){
            addUniform(name, type);
        }else throw new Error("Unknown uniform type " + type);
    }
    return {
        program: program,
        uniformLocs: uniformLocs,
        uniformTypes: uniformTypes
    }
}


function bindAttributeBuffer(gl, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,-1, 1,-1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}


function extractUniformDeclarations(str){
    var uniforms = {};
    str = str.replace(/((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g, '')
    str = str.replace(/\/\/.*\n/g, '')
    var m, re = /uniform\s*([\w_]+)\s*([\w_]+)/g;
    while (m = re.exec(str)) uniforms[m[2]] = m[1];
    return uniforms;
}

function createShaderProgram(gl, vertexSource, fragmentSource) {
    var vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    var fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // interestingly enough it seems like Safari never emits
    // a shader program link error. 
    checkLinkError(gl, program, fragmentSource, vertexSource);

    return program;
}


function compileShader(gl, shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    checkShaderError(gl, shader, shaderSource, shaderType)
    return shader;
}


