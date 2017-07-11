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

		it('should throw when pased weird stuff', function(){
			assert.throws(e => new Tensor(gl, [5, 5], "poop"))
		})

		it('should throw when attempting to call swap', function(){
			var t = new OutputTensor(gl, [2, 2])
			assert.throws(e => t.swap())
            t.destroy()

            var t = new Tensor(gl, [2, 2])
			assert.throws(e => t.swap())
            t.destroy()

            // don't throw for real inplacetensor
            var t = new InPlaceTensor(gl, [2, 2])
			t.swap()
            t.destroy()
		})
	
	})
	
    
    
    
    // new Tensor(gl, [1, 1], data)
    // new Tensor(gl, [1, 1], data, { type, pack, codec, density })
    // new Tensor(gl, [1, 1], { type, pack, codec, density })
    
    // new Tensor(gl, [1, 1], 'float32')
    // new Tensor(gl, [1, 1], 'uint8')
    // new Tensor(gl, { shape, data })
    // new Tensor(gl, { width, height, data })
    // pix = new Tensor(gl, [1, 1, 4], [1, 0.4, 3, 4], 'uint8')
	describe('Creation', function(){
        // new Tensor(gl)
        // new Tensor(gl, [1, 1])
        // new Tensor(gl, [1, 1], null)

		it('should create 1x1 tensor', function() {
			var t = new Tensor(gl)
			assert.deepEqual(t.shape, [1, 1, 1, 1]);
			assert.equal(t.type, 'float32')
            t.destroy()
		});

        // new Tensor(gl, [1, 1], 'float32')
        ['uint8', 'float32'].forEach(type => {
            it('should create ' + type + ' tensor', function() {
                var t = new Tensor(gl, [1, 1], type)
                assert.deepEqual(t.shape, [1, 1, 1, 1]);
                assert.equal(t.type, type)
                t.destroy()
            });
        })
        
        // new Tensor(gl, [1, 1], 'softfloat')
        it('should create softfloat tensor', function() {
			var t = new Tensor(gl, [1, 1], 'softfloat')
			assert.deepEqual(t.shape, [1, 1, 1, 1]);
			assert.equal(t.type, 'float32')
            t.destroy()
		});

        // var t = new Tensor(gl, [5, 5])
		it('should create 5x5 tensor', function() {
			var t = new Tensor(gl, [5, 5])
			assert.deepEqual(t.shape, [5, 5, 1, 1]);
			assert.equal(t.type, 'float32')
            t.destroy()
		});
	})


	describe('Initialization/Readback', function(){
		// it('should load float32array', function() {
		// 	var t = new OutputTensor(gl, [2, 2], new Float32Array([ 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0 ]))
		// 	assert.deepEqual(t.shape, [2, 2, 1, 1]);
		// 	assert(ndt.equal(t.read2(), ndpack([[1, 3], [2, 4]])))
		// });

	// 	it('should load uint8array', function() {
	// 		var t = new OutputTensor(gl, [2, 2], new Uint8Array([ 255, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0 ]))
	// 		assert.deepEqual(t.shape, [2, 2, 1, 1]);
	// 		assEqual(t.read2(), ndpack([[1, 0], [127/255, 64/255]]))
	// 	});

	// 	it('should load uint8clampedarray', function() {
	// 		var t = new OutputTensor(gl, [2, 2], new Uint8ClampedArray([ 255, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0 ]))
	// 		assert.deepEqual(t.shape, [2, 2, 1, 1]);
	// 		assEqual(t.read2(), ndpack([[1, 0], [127/255, 64/255]]))
	// 	});

	// 	it('should show uint8clampedarray', function() {
	// 		var t = new OutputTensor(gl, [2, 2], new Uint8ClampedArray([ 255, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0 ]))
	// 		assert.deepEqual(t.shape, [2, 2, 1, 1]);
	// 		t.show()
	// 	});
		
	// 	it('should load imagedata', function() {
	// 		var im = {
	// 			width: 2,
	// 			height: 2,
	// 			data: new Uint8ClampedArray([ 255, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0 ])
	// 		}
	// 		var t = new OutputTensor(gl, im)
	// 		assert.deepEqual(t.shape, [2, 2, 1, 1]);
	// 		assEqual(t.read2(), ndpack([[1, 0], [127/255, 64/255]]))
	// 	});

	// 	it('should load float64array', function() {
	// 		var t = new OutputTensor(gl, [2, 2], new Float64Array([ 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0 ]))
	// 		assert.deepEqual(t.shape, [2, 2, 1, 1]);
	// 		assert(ndt.equal(t.read2(), ndpack([[1, 3], [2, 4]])))
	// 	});


	// 	it('should load plain array', function() {
	// 		var t = new OutputTensor(gl, [2, 2], [ 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0 ])
	// 		assert.deepEqual(t.shape, [2, 2, 1, 1]);
	// 		assert(ndt.equal(t.read2(), ndpack([[1, 3], [2, 4]])))
	// 	});		
	// })

	// describe('Update', function(){
	// 	it('should throw for wrong shape update', function() {
	// 		var t = new OutputTensor(gl, [2, 2], new Float64Array([ 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0 ]))
	// 		assert.deepEqual(t.shape, [2, 2, 1, 1]);
	// 		assert(ndt.equal(t.read2(), ndpack([[1, 3], [2, 4]])))

	// 		assert.throws(() => t.update(ndarray(new Float32Array(25), [5,5])))
	// 	});
	})


	describe('Copy', function(){
		// describe('Simple Array', function(){

		// 	var floatData = [ 1, 0.2, 0.6, 0.8 ];
		// 	var t = new OutputTensor(gl, [1, 1, 4], new Float32Array(floatData))

		// 	it('should read out intact', function() {
		// 		assert.deepEqual(t.shape, [1, 1, 4, 1]);

		// 		assEqual(t.read().pick(0, 0, null, 0), ndpack(floatData));
		// 	});

		// 	it('should read intact after float32 copy', function() {
		// 		assEqual(t.copy('float32').read().pick(0, 0, null, 0), ndpack(floatData));
		// 	});

		// 	it('should read approximation after uint8 copy', function() {
		// 		assert.deepEqual(t.copy('uint8')._read(), 
		// 			floatData.map(k => Math.round(255 * k)))
		// 	})

		// 	it('should read intact after nofloat copy', function() {
		// 		var nofloat = t.copy('nofloat');
		// 		assEqual(nofloat.read().pick(0, 0, null, 0), ndpack(floatData));

		// 		assert.deepEqual(nofloat._read(), new Uint8Array(new Float32Array(floatData).buffer))
		// 	});
		// })

		// describe('Hi Logan', function(){

		// 	var floatData = [ 1, 0.2, 0.6, 0.8 ];
		// 	var t = new OutputTensor(gl, [1, 1, 4], new Float32Array(floatData), { nofloat: true })

		// 	it('should read out intact', function() {
		// 		assert.deepEqual(t.shape, [1, 1, 4, 1]);

		// 		assEqual(t.read().pick(0, 0, null, 0), ndpack(floatData));
		// 	});

		// 	it('should read intact after float32 copy', function() {
		// 		assEqual(t.copy('float32').read().pick(0, 0, null, 0), ndpack(floatData));
		// 	});

		// 	it('should read approximation after uint8 copy', function() {
		// 		assert.deepEqual(t.copy('uint8')._read(), 
		// 			floatData.map(k => Math.round(255 * k)))
		// 	})

		// 	it('should read intact after nofloat copy', function() {
		// 		var nofloat = t.copy('nofloat');
		// 		assEqual(nofloat.read().pick(0, 0, null, 0), ndpack(floatData));

		// 		assert.deepEqual(nofloat._read(), new Uint8Array(new Float32Array(floatData).buffer))
		// 	});
		// })
		
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

		it('should be the same after being softfloat copied', function(){
			var softfloat = t.copy('softfloat');
			assert.equal(softfloat.type, 'float32')
			assert.equal(softfloat.format.type, 'uint8')
			assEqual(softfloat.read(), array)
		})
	})

	describe('NDArray', function(){
		it('should load 1 element vector float32 ndarray', function() {
			var array = ndpack([5])
			var t = new OutputTensor(gl, array)
			// console.log(t.read().shape, array.shape)
			assEqual(t.read(), array)
		});	

		it('should load 2x2 float32 ndarray', function() {
			var array = ndpack([[1, 2], [3, 4]])
			var t = new OutputTensor(gl, array)
			assEqual(t.read(), array)
		});	

		// it('should load 2x2 uint8 ndarray', function() {
		// 	var array = ndarray(new Uint8Array([255, 127, 32, 4]), [2, 2])
		// 	var t = new OutputTensor(gl, array)
		// 	assEqual(t.read(), ndpack([[1, 127/255], [32/255, 4/255]]))
		// });	

		it('should print 2x2 float32 ndarray', function(){
			var array = ndarray(new Float32Array([1, 2, 3, 4]), [2, 2])
			var t = new OutputTensor(gl, array)
			assert.equal(t.print(), '   1.000    2.000\n   3.000    4.000')
		})

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

	describe('softfloat', function(){
		it('should create softfloat tensor', function() {
			var t = new Tensor(gl, [1, 1], 'softfloat')
			assert.deepEqual(t.shape, [1, 1, 1, 1]);
			assert.equal(t.type, 'float32')
			assert.equal(t.format.type, 'uint8')
		});

		it('should do stuff with read', function() {
			var array = ndpack([
				[[[1, 2], [-3, 18]], [[Math.PI, 2], [3, 4]]], 
				[[[13, 2], [33, 4]], [[1, 0.2], [Math.E, 4]]]
			])
			var t = new OutputTensor(gl, array)
			assEqual(t.read(), array)
		});	

		// it('should read nofloat tensor', function() {
		// 	var t = new OutputTensor(gl, [1, 1, 4], [13.7, -4, 15.2, 1], { nofloat: true })

		// 	assert.deepEqual(t.shape, [1, 1, 4, 1]);
		// 	assert.equal(t.type, 'float32')
		// 	assert.equal(t.nofloat, true)
		// 	assert.deepEqual(t.texSize, [4, 1])

		// 	assEqual(t.read().pick(0, 0, null, 0), ndpack([13.7, -4, 15.2, 1]))

		// 	assert.deepEqual(t._read(), [ 51, 51, 91, 65, 0, 0, 128, 192, 51, 51, 115, 65, 0, 0, 128, 63 ])
		// });

		it('should show nofloat tensor', function(){
			var t = new OutputTensor(gl, [1, 1, 4], ndpack([13.7, -4, 15.2, 1]), 'softfloat')
			t.show()
		})

	// 	it('should show raw tensor', function(){
	// 		var t = new OutputTensor(gl, [1, 1, 4], [13.7, -4, 15.2, 1], { nofloat: true })
	// 		t._show()
	// 	})

	})


})