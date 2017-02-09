// import assert from 'assert'
// import { Tensor, OutputTensor, InPlaceTensor, Run, Compile } from '../src/index.js'
// import headlessGL from "gl"
// import ndt from 'ndarray-tests'
// import ndpack from 'ndarray-pack'
// import ndunpack from 'ndarray-unpack'
// import ndshow from 'ndarray-show'
// import ndarray from 'ndarray'

// function assEqual(a, b){
// 	if(ndt.equal(a, b, 1e-5)){

// 	}else{
// 		throw new Error('Unequal NDArrays\nFound: \n' + ndshow(a) + '\nExpected: \n' + ndshow(b))
// 	}
// }

// const ECHO_LOCATION = `
// 	vec4 process(ivec4 pos){
// 		return vec4(pos);
// 	}
// `;


// describe('Basic', () => {

// 	var gl = headlessGL(100, 100, { preserveDrawingBuffer: true })
// 	var out = new OutputTensor(gl, [5, 5, 4]);

// 	describe('Input Validation', function(){
// 		it('should throw for non-string shader', function() {
// 			assert.throws(e => Run(null, out))
// 			assert.throws(e => Compile(null, out))
// 		});

// 		it('should throw for non-output tensor', function() {
// 			var input = new Tensor(gl, [5, 5])
// 			assert.throws(e => Run(ECHO_LOCATION, input))
// 			assert.throws(e => Compile(ECHO_LOCATION, input))
// 		});

// 		it('should throw for syntax error', function() {
// 			var input = new OutputTensor(gl, [5, 5])
// 			assert.throws(e => Run(ECHO_LOCATION + '-', input))
// 			assert.throws(e => Compile(ECHO_LOCATION + '-', input))
// 		});

// 		it('should throw for unknown uniforms', function(){
// 			assert.throws(e => Run(ECHO_LOCATION, out, { color: [0, 1, 1, 1] }))
// 		})

// 		it('should throw for matrix uniforms', function(){
// 			const KEANU = `
// 				uniform mat4 wolo;
// 				vec4 process(ivec4 pos){
// 					return vec4(pos);
// 				}
// 			`;
// 			assert.throws(e => Run(KEANU, out))
// 		})
// 	})
// 	describe('basic', function(){
// 		it('should echo locations', function(){
// 			Run(ECHO_LOCATION, out)

// 			assEqual(out.read().pick(null, null, 0, 0), ndpack([ 
// 					[ 0, 0, 0, 0, 0 ],
// 					[ 1, 1, 1, 1, 1 ],
// 					[ 2, 2, 2, 2, 2 ],
// 					[ 3, 3, 3, 3, 3 ],
// 					[ 4, 4, 4, 4, 4 ] ]))
// 			assEqual(out.read().pick(null, null, 1, 0), ndpack([ 
// 					[ 0, 1, 2, 3, 4 ],
// 					[ 0, 1, 2, 3, 4 ],
// 					[ 0, 1, 2, 3, 4 ],
// 					[ 0, 1, 2, 3, 4 ],
// 					[ 0, 1, 2, 3, 4 ] ]));
// 		})
// 	})
// 	describe('basic uniforms', function(){
// 		it('should accept vec4 uniforms', function(){
// 			const SOLID_FILL4 = `
// 				uniform vec4 color;
// 				vec4 process(ivec4 pos){
// 					return color;
// 				}
// 			`;
// 			Run(SOLID_FILL4, out, { color: [0.5, 1, 1, 1] })
// 			assEqual(out.read().pick(0, 0, null, 0), ndpack([0.5, 1, 1, 1]))
// 			// console.log(ndshow(out.read().pick(0, 0, null, 0)))
// 		})

// 		it('should accept vec3 uniforms', function(){
// 			const SOLID_FILL3 = `
// 				uniform vec3 color;
// 				vec4 process(ivec4 pos){
// 					return vec4(color, 14);
// 				}
// 			`;
// 			Run(SOLID_FILL3, out, { color: [0.5, -0.8, 1] })
// 			assEqual(out.read().pick(0, 0, null, 0), ndpack([0.5, -0.8, 1, 14]))
// 		})	

// 		it('should accept vec2 uniforms', function(){
// 			const SOLID_FILL2 = `
// 				uniform vec2 color;
// 				vec4 process(ivec4 pos){
// 					return vec4(color, -3, 14);
// 				}
// 			`;
// 			Run(SOLID_FILL2, out, { color: [-5, 2] })
// 			assEqual(out.read().pick(0, 0, null, 0), ndpack([-5, 2, -3, 14]))
// 		})	

// 		it('should accept float uniforms', function(){
// 			const SOLID_FILL_FLOAT = `
// 				uniform float color;
// 				vec4 process(ivec4 pos){
// 					return vec4(0.2, color, -3, 14);
// 				}
// 			`;
// 			Run(SOLID_FILL_FLOAT, out, { color: Math.PI })
// 			assEqual(out.read().pick(0, 0, null, 0), ndpack([0.2, Math.PI, -3, 14]))
// 		})	

// 		it('should accept int uniforms', function(){
// 			const SOLID_FILL_INT = `
// 				uniform int color;
// 				vec4 process(ivec4 pos){
// 					return vec4(0.2, color, 1, 87);
// 				}
// 			`;
// 			Run(SOLID_FILL_INT, out, { color: 17 })
// 			assEqual(out.read().pick(0, 0, null, 0), ndpack([0.2, 17, 1, 87]))
// 		})	
// 	})


// 	describe('in place tensor', function(){
// 		const INCREMENT = `
// 			uniform Tensor image;
// 			vec4 process(ivec4 pos){
// 				return readTensor(image, pos) + vec4(1,1,1,1);
// 			}
// 		`;
// 		it('should increment things', function(){
			
// 			var out = new InPlaceTensor(gl, ndpack([
// 				[5, 6], 
// 				[-3, 0]]));

// 			assEqual(out.read2(), ndpack([
// 				[5, 6],
// 				[-3, 0]]))
// 			Run(INCREMENT, out, { image: out })
// 			assEqual(out.read2(), ndpack([
// 				[6, 7],
// 				[-2, 1]]))

// 			out.destroy()
// 		})

// 		it('should throw for other tensors', function(){
// 			var out = new OutputTensor(gl, ndpack([
// 				[5, 6], 
// 				[-3, 0]]));

// 			assert.throws(() => Run(INCREMENT, out, { image: out }))
// 		})
// 	})


	
// })