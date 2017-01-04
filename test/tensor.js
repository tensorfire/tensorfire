import assert from 'assert'
import { Tensor, OutputTensor, InPlaceTensor } from '../src/tensor/index.js'
import headlessGL from "gl"
import ndt from 'ndarray-tests'
import ndpack from 'ndarray-pack'
import ndshow from 'ndarray-show'

function assEqual(a, b){
	if(ndt.equal(a, b, 1e-5)){

	}else{
		throw new Error('Unequal NDArrays\nFound: \n' + ndshow(a) + '\nExpected: \n' + ndshow(b))
	}
}

describe('Tensor', () => {

	var gl = headlessGL(100, 100, { preserveDrawingBuffer: true })

	it('should create tensors', function() {
		var t = new Tensor(gl, [5, 5])
		assert.deepEqual(t.shape, [5, 5, 1, 1]);
	});


	it('should throw when passed invalid shape', function() {
		assert.throws(e => new Tensor(gl, [5, -5]))
	});


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


})