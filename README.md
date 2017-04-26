# TensorFire Tutorial

Here's a simple tutorial that will hopefully get you started with using the low-level TensorFire tensor manipulation library. If you're just trying to get an existing neural network to run in the browser, you should probably look into our high-level interface for importing from Keras/TensorFlow. 


### Creating Tensors

A tensor is an n-dimensional generalization of arrays and matrices. An element in an array is identified with one index, and an element in a matrix can be located with two indices, and a tensor generalizes this idea to an arbitrary number of indices. As far as this library is concerned, however, we're only concerned with tensors of rank 4 (where elements are addressed with four indices). 

For dealing with tensors in Javascript, we use the [ndarray package](https://github.com/scijs/ndarray) by the scijs project, which provides a simple and fast interface for creating, importing, and manipulating tensors. 

```js
var ndpack = require("ndarray-pack");
X = new Tensor(gl, ndpack([
    [0,0,1],
    [0,1,1],
    [1,0,1],
    [1,1,1]
]))
```

Here we're using [ndarray-pack](https://github.com/scijs/ndarray-pack) to import a nested array of arrays as a tensor. The dimensions of the resulting tensor (given by `X.shape`) are `[4, 3, 1, 1]`. This resulting Tensor object can be passed as an argument to a tensor operation (which we'll get to in the next section). 

We can also create a tensor by specifying its shape, but without specifying its contents. In this case, all the elements are initialized to zero.

```js
outputTensor = new OutputTensor(gl, [4, 4])
```

Regular `Tensor` instances are read-only. Once it's been initialized with some contents, its values can't be changed, and it can't be used as the destination for a tensor operation. 

You can, however, instantiate an `OutputTensor` instead in exactly the same way as a regular `Tensor`. It has all the same capabilities, but you're also allowed to update its contents and set it as a destination for tensor operations. However, you can't use the same instance of an `OutputTensor` as both the input and output to a tensor operation (for that, you'll need an `InPlaceTensor`).

### Defining a Tensor Operation

At its heart, TensorFire is a framework for writing tensor operations in GLSL (the OpenGL shader language). The code for a tensor operation is embedded in Javascript as an ordinary string (we're using ES6's backtick syntax for multi-line strings). 

```js
const Subtraction = `
    uniform Tensor a;
    uniform Tensor b;
    
    float process(ivec4 pos) {
        return a.read(pos) - b.read(pos);
    }
`;
```

The heart of a tensor operation is the `float process(ivec4 pos)` method. It gets called once for each possible coordinate in the output tensor of the coordinate. All the outputs are then saved into the appropriate location in the specified output tensor. In the above example, the output value is computed as the elementwise difference between two `Tensor` uniforms (`a` and `b`). However, you can just as easily sum over a range of relative indices to represent a convolution. 

A tensor operation takes a certain number of parameters as inputs called "uniforms" (borrowing from OpenGL's lingo). These uniforms can be `float`, `int`, `vec2`, `vec4`, or any valid GLSL type. Most interestingly is is the `Tensor` type, which lets us have tensors as input.

### Reading Tensors
```c
uniform Tensor a;
uniform Tensor b;

float process(ivec4 pos) {
    return a.read(pos) - b.read(pos);
}
```
You can read the value of any `Tensor` uniform with the `Tensor::read(ivec4 pos)` method. It reads the value found at the given position

As shorthand, `.read(x, y[, z, w])` is automatically interpreted as `.read(ivec4(x, y, z, w))` with missing values set to zero. 

### Vectorized Methods

We've discussed `float process(ivec4 pos)` and `float Tensor::read(ivec4 pos)` so far as how you process and read tensors, respectively. But it's somewhat inefficient to invoke `process` and `read` so many times, even on massively parallel hardware like a GPU. 

Graphics cards have a bunch of features for efficiently working with 4-vectors, so we also have vectorized analogues for `process` and `read`. 

```c
vec4 process4(ivec4 pos) {
    return a.read4(pos) - b.read4(pos);
}
```

When using `process4`, rather than calling every possible value for `ivec4 pos`, we skip around the `z` coordinate in increments of four. It expects a response in the form of a `vec4` which will populate that range of coordinates. 

Analogously, `.read4(ivec4 pos)` rounds the `z` coordinate down to the nearest multiple of 4 and emits another `vec4` of values. 

### Running Tensor Operations

Once we've defined an output tensor, we can start running tensor operations with the `Run` method. 

```js
outputTensor.run(Subtraction, { a: X, b: Y })
```

The first argument is expected to be a string with the source code of the tensor operation, and the second argument is a dictionary of all the values for uniforms that will be passed into the operation. 

These operations can be thought of as executing synchronously. This isn't technically true as `run` will return instantaneously, merely adding to a processing queue handled by the GPU at its own discretion. However, it automatically tracks dependencies, so you shouldn't have to worry about stale data or race conditions. 

If you ever call a function which does I/O, such as reading the value of a tensor from within Javascript, it'll cause the browser to pause until the GPU is done with its queue. 

If you need to be asynchronously notified upon the completion of an operation, you can pass a callback as an argument after the uniforms dictionary.


### Tensor Domain Specific Language

The language that we've been using to write our shaders is mostly GLSL, with a few additional convenience features that comprise our tensor shader domain specific language (DSL) codenamed TNSL. 

The first, which you've already seen on this page is how we specify `Tensor` uniforms:

	uniform Tensor a;

This is reminiscent of struct syntax, but it actually gets compiled into a series of uniform declarations (some browsers, like Microsoft Edge don't support `sampler2D` within structs). 

Tensors have properties which are accessed like struct properties:

	ivec4 a.shape
	ivec2 a.texSize

Next is the object-oriented syntax for reading from tensors:

	float process(ivec4 pos) {
        return a.read(pos) - b.read(pos);
    }

Structs can't have methods in GLSL, so `a.read(pos)` gets transformed into `a_read(pos)`. The `pos` argument is expected to be an `ivec4` vector, however there's some additional syntactic sugar which automatically transforms `a.read(x, y)` into `a_read(ivec4(x, y, 0, 0))`. That is, it will automatically pad coordinates with zero if there is more than one argument specified. Note that this tranformation only happens with two or more arguments.

Finally, GLSL is often quite annoying for lacking . 





