# Reading the Source

So if you're really committed to learning how to commit to this repository, it might be a pretty good idea to understand how all of this stuff is implemented. 

There's some amount of effort that has been put into making Max Goldman happy, but of course, fuck 6.005. 

## Layout

There are three files which expose user-facing APIs:

- runtime/index.js (Run, Compile)
- tensor/index.js (Tensor, OutputTensor, InPlaceTensor)
- util.js (createGL)

The rest of the files are just there for support. 

### Runtime

- index.js: this is the entry point which defines Run and Compile
- check.js: a bunch of code stolen from REGL which pretty-prints error messages
- frag.js: this is essentially a macro preprocessor that stiches together glsl files
- glsl/
	- frag_header.glsl: this defines the core GLSL tensor library, including the data structures

	- read_normal.glsl: implements readTensor
	- read_nofloat.glsl

	- write_normal.glsl: implements encoding logic
	- write_nofloat.glsl

	- activations.js: activation functions (eg. sigmoid, tanh, relu)
- program.js: creates programs out of shaders
- tnsl.js: domain specific language for tensor stuff


### Tensor

- index.js: the main definitions of Tensor, OutputTensor, and InPlaceTensor
- pack.js: converting to/from ndarrays to packed textures
- show.js: show textures