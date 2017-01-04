import assert from 'assert'
import { Tensor, OutputTensor, InPlaceTensor } from '../src/tensor/index.js'
import headlessGL from "gl"
import ndt from 'ndarray-tests'
import ndpack from 'ndarray-pack'
import ndshow from 'ndarray-show'
import ndarray from 'ndarray'

function assEqual(a, b){
	if(ndt.equal(a, b, 1e-5)){

	}else{
		throw new Error('Unequal NDArrays\nFound: \n' + ndshow(a) + '\nExpected: \n' + ndshow(b))
	}
}

describe('Tensor', () => {

	var gl = headlessGL(100, 100, { preserveDrawingBuffer: true })

	describe('Input Validation', function(){
		it('should throw when passed invalid gl', function() {
			assert.throws(e => new Tensor({}, [5, -5]))
		});

		it('should throw when passed invalid shape', function() {
			assert.throws(e => new Tensor(gl, [5, -5]))
			assert.throws(e => new Tensor(gl, [5, null]))
			assert.throws(e => new Tensor(gl, [0, 1]))
			assert.throws(e => new Tensor(gl, [3, 1.2]))
		});

		it('should throw when pased data of wrong length', function(){
			assert.throws(e => new Tensor(gl, [5, 5], [1, 2]))
		})
	
	})
	
	describe('Creation', function(){
		it('should create 1x1 tensor', function() {
			var t = new Tensor(gl)
			assert.deepEqual(t.shape, [1, 1, 1, 1]);
			assert.equal(t.type, 'float32')
		});

		it('should create uint8 tensor', function() {
			var t = new Tensor(gl, [1, 1], 'uint8')
			assert.deepEqual(t.shape, [1, 1, 1, 1]);
			assert.equal(t.type, 'uint8')
		});

		it('should create float32 tensor', function() {
			var t = new Tensor(gl, [1, 1], 'float32')
			assert.deepEqual(t.shape, [1, 1, 1, 1]);
			assert.equal(t.type, 'float32')
		});

		it('should create tensor', function() {
			var t = new Tensor(gl, [5, 5])
			assert.deepEqual(t.shape, [5, 5, 1, 1]);
			assert.equal(t.type, 'float32')
		});
	})


	describe('Initialization/Readback', function(){
		it('should load float32array', function() {
			var t = new OutputTensor(gl, [2, 2], new Float32Array([ 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0 ]))
			assert.deepEqual(t.shape, [2, 2, 1, 1]);
			assert(ndt.equal(t.read2(), ndpack([[1, 3], [2, 4]])))
		});

		it('should load uint8array', function() {
			var t = new OutputTensor(gl, [2, 2], new Uint8Array([ 255, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0 ]))
			assert.deepEqual(t.shape, [2, 2, 1, 1]);
			assEqual(t.read2(), ndpack([[1, 0], [127/255, 64/255]]))
		});

		it('should load uint8clampedarray', function() {
			var t = new OutputTensor(gl, [2, 2], new Uint8ClampedArray([ 255, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0 ]))
			assert.deepEqual(t.shape, [2, 2, 1, 1]);
			assEqual(t.read2(), ndpack([[1, 0], [127/255, 64/255]]))
		});

		it('should show uint8clampedarray', function() {
			var t = new OutputTensor(gl, [2, 2], new Uint8ClampedArray([ 255, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0 ]))
			assert.deepEqual(t.shape, [2, 2, 1, 1]);
			t.show()
		});

		it('should load plain array', function() {
			var t = new OutputTensor(gl, [2, 2], [ 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0 ])
			assert.deepEqual(t.shape, [2, 2, 1, 1]);
			assert(ndt.equal(t.read2(), ndpack([[1, 3], [2, 4]])))
		});		
	})


	describe('Copy Tests', function(){
		describe('Simple Array', function(){

			var floatData = [ 1, 0.2, 0.6, 0.8 ];
			var t = new OutputTensor(gl, [1, 1, 4], new Float32Array(floatData))

			it('should read out intact', function() {
				assert.deepEqual(t.shape, [1, 1, 4, 1]);

				assEqual(t.read().pick(0, 0, null, 0), ndpack(floatData));
			});

			it('should read intact after float32 copy', function() {
				assEqual(t.copy('float32').read().pick(0, 0, null, 0), ndpack(floatData));
			});

			it('should read approximation after uint8 copy', function() {
				assert.deepEqual(t.copy('uint8')._read(), 
					floatData.map(k => Math.round(255 * k)))
			})

			it('should read intact after nofloat copy', function() {
				var nofloat = t.copy('nofloat');
				assEqual(nofloat.read().pick(0, 0, null, 0), ndpack(floatData));

				assert.deepEqual(nofloat._read(), new Uint8Array(new Float32Array(floatData).buffer))
			});
		})
		describe('Hi Logan', function(){

			var floatData = [ 1, 0.2, 0.6, 0.8 ];
			var t = new OutputTensor(gl, [1, 1, 4], new Float32Array(floatData), { nofloat: true })

			it('should read out intact', function() {
				assert.deepEqual(t.shape, [1, 1, 4, 1]);

				assEqual(t.read().pick(0, 0, null, 0), ndpack(floatData));
			});

			it('should read intact after float32 copy', function() {
				assEqual(t.copy('float32').read().pick(0, 0, null, 0), ndpack(floatData));
			});

			it('should read approximation after uint8 copy', function() {
				assert.deepEqual(t.copy('uint8')._read(), 
					floatData.map(k => Math.round(255 * k)))
			})

			it('should read intact after nofloat copy', function() {
				var nofloat = t.copy('nofloat');
				assEqual(nofloat.read().pick(0, 0, null, 0), ndpack(floatData));

				assert.deepEqual(nofloat._read(), new Uint8Array(new Float32Array(floatData).buffer))
			});
		})
		describe('Complex Array', function(){
			var array = ndpack([
				[[[1, 2, -1], [-3, 18, 0.3]], [[Math.PI, 2, 0.001], [-11323, 3, 4]]], 
				[[[13, 2, 14], [33, 4, 6]], [[1, 0.2, 1.1], [23383, Math.E, 4]]]
			])
			var t = new OutputTensor(gl, array)

			it('should read out the matrix intact', function(){
				assEqual(t.read(), array)
			})

			it('should be the same after being float32 copied', function(){
				assEqual(t.copy('float32').read(), array)
			})

			it('should be the same after being nofloat copied', function(){
				var nofloat = t.copy('nofloat');
				assert.equal(nofloat.nofloat, true)
				assert.equal(nofloat.type, 'float32')
				assEqual(nofloat.read(), array)
			})
		})
	})

	describe('NDArray', function(){
		it('should load 1 element vector float32 ndarray', function() {
			var array = ndpack([5])
			var t = new OutputTensor(gl, array)
			assEqual(t.read().pick(null, 0, 0, 0), array)
		});	

		it('should load 2x2 float32 ndarray', function() {
			var array = ndpack([[1, 2], [3, 4]])
			var t = new OutputTensor(gl, array)
			assEqual(t.read2(), array)
		});	

		it('should load 2x2 uint8 ndarray', function() {
			var array = ndarray(new Uint8Array([1, 2, 3, 4]), [2, 2])
			var t = new OutputTensor(gl, array)
			assEqual(t.read2(), array)
		});	

		it('should load 2x2x2 float32 ndarray', function() {
			var array = ndpack([[[1, 2], [3, 4]], [[1, 2], [3, 4]]])
			var t = new OutputTensor(gl, array)
			assEqual(t.read().pick(null, null, null, 0), array)
		});	

		it('should load 2x2x2x2 float32 ndarray', function() {
			var array = ndpack([
				[[[1, 2], [-3, 18]], [[Math.PI, 2], [3, 4]]], 
				[[[13, 2], [33, 4]], [[1, 0.2], [Math.E, 4]]]
			])
			var t = new OutputTensor(gl, array)
			assEqual(t.read(), array)
		});	

	})

	describe('NOFLOAT', function(){
		it('should create nofloat tensor', function() {
			var t = new Tensor(gl, [1, 1], 'nofloat')
			assert.deepEqual(t.shape, [1, 1, 1, 1]);
			assert.equal(t.type, 'float32')
			assert.equal(t.nofloat, true)
			assert.deepEqual(t.texSize, [4, 1])
		});

		it('should read nofloat tensor', function() {
			var t = new OutputTensor(gl, [1, 1, 4], [13.7, -4, 15.2, 1], { nofloat: true })

			assert.deepEqual(t.shape, [1, 1, 4, 1]);
			assert.equal(t.type, 'float32')
			assert.equal(t.nofloat, true)
			assert.deepEqual(t.texSize, [4, 1])

			assEqual(t.read().pick(0, 0, null, 0), ndpack([13.7, -4, 15.2, 1]))

			assert.deepEqual(t._read(), [ 51, 51, 91, 65, 0, 0, 128, 192, 51, 51, 115, 65, 0, 0, 128, 63 ])
		});

		it('should show nofloat tensor', function(){
			var t = new OutputTensor(gl, [1, 1, 4], [13.7, -4, 15.2, 1], { nofloat: true })
			t.show()
		})

		it('should show raw tensor', function(){
			var t = new OutputTensor(gl, [1, 1, 4], [13.7, -4, 15.2, 1], { nofloat: true })
			t._show()
		})


	})


})