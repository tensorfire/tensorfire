# WebGL Tensor Library

Look at all the unit tests!


# nostruct branch

There are a few problems with the current implementation which may be solved by migrating away from the current tensor struct based approach:

- errors for sampler2D in struct in microsoft edge
- errors for sampler in struct in firefox on vmware
- errors for sampler in struct on google pixel
- heterogeneous nofloat on ios

The current implementation defines a struct for containing information about tensors:

	struct Tensor {
	    sampler2D tex;
	    ivec2     texSize;
	    ivec4     shape; // [width, height, channel+depth, batch]
	    int       cols;
	};

The tensors are accessed with the `readTensor(Tensor t, ivec4 pos)` function. 


In the future, we'll generate a special function for reading each tensor. This enables us to have different encodings for different tensors within the same shader. 

	uniform sampler2D image_tex;
	uniform ivec2 image_texSize;
	uniform ivec4 image_shape;
	uniform int image_cols;
	
    vec4 __read_image(ivec4 pos){
        return texture2D(image_tex, (
            vec2(tile2vec(
                vec2tile(pos.zw, ceildiv(image_shape.z, 4))
            , cols) * image_shape.xy) +
            vec2(pos.xy) + vec2(0.5, 0.5)
        ) / vec2(image_size));
    }

We can introduce some syntactic sugar around accessing these tensors. 

    #image[xyz] // __read_image(ivec4(xyz))

This also opens the door to supporting many more tensor formats. 

- floating point (1 pixel to encode vec4, float range)
- nofloat (4 pixels to encode one vec4, float range)
- fixnum (4 pixels to encode one vec4, linear range)

Each can be represnted on a uint8 texture, and only floating point can be represented on a floating point texture (technically the others could too but there's no point in doing so). 

What's needed for each encoding

- javascript write implementation
	- encode ndarray as this kind of texture
- glsl read implementation
	- return vec4 from position
- glsl write implementation
	- return color based on vec4
- javascript read implementation
	- decode texture values into ndarray


Formats:

- normal
- simple
- simple-nofloat

- fixnum
- nofloat


Pseudocode

function Compile(shader, output, params){
	code = ''
	code += lookupTensorWriteGLSL(output.encoding)
	for name in params {
		if param is Tensor {
			code += lookupTensorReadGLSL(param)
		}
	}
	cacheProgram(compileAndLink(code))
}

function Run(shader, output, params){
	Compile(shader, output, params)
	for name in params {
		if param is Tensor {
			for uniform in tensor {
				setUniform(lookupUniform(uniform), tensor[uniform])
			}
		}
	}
}


Tensor API:

class Tensor {
	type: uint8 | float32
	
	_type: uint8 | float32
	_format: fixnum | nofloat | normal | simple

	constructor(shape){
		this._uniforms = format.allocate(shape)

	}
	_read(){
		return gl.readPixels...
	}

	read(){
		return format.unpack(this._read())
	}


	_update(data){
		gl.bindTexture(this.tex)
		gl.texImage2D(data)
	}
	update(data){
		this._update(format.pack(data))
	}
}



Texture (really low level)

class Texture {
	type: uint8 | float32
	constructor(texSize){
		gl.createTexture
	}
	update(data){
		gl.texImage2D()
	}
	read(){
		gl.readPixels()
	}
}




Texture (Low Level) API:

class Texture {
	constructor(type, format, shape){
		this.uniforms = format.init(shape)
	}
	update(data){
		gl.texImage2D(format.pack(this.uniforms, data))
	}
	read(){
		return format.unpack(gl.readPixels());
	}
}


The texture is a low-level API. The "type" is "uint8" if the underlying texture representation is a gl.UNSIGNED_BYTE, "type" is only "float32" if the underlying texture representation is a gl.FLOAT.







