import assert from 'assert'
import { Tensor, OutputTensor, InPlaceTensor, Run, Compile } from '../src/index.js'
import headlessGL from "gl"
import ndt from 'ndarray-tests'
import ndpack from 'ndarray-pack'
import ndunpack from 'ndarray-unpack'
import ndshow from 'ndarray-show'
import ndarray from 'ndarray'

function assEqual(a, b){
	if(ndt.equal(a, b, 1e-5)){

	}else{
		throw new Error('Unequal NDArrays\nFound: \n' + ndshow(a) + '\nExpected: \n' + ndshow(b))
	}
}


const IDENTITY = `
	uniform Tensor image;

	vec4 process(ivec4 pos){
		return readTensor(image, pos);
	}
`;


describe('Activations', () => {
	var gl = headlessGL(100, 100, { preserveDrawingBuffer: true })

	describe('linear', () => {
		it('should not change anything', () => {
			var arr = ndpack([
				[5, 6], 
				[-3, 0]]),
				inp = new Tensor(gl, arr),
				out = new OutputTensor(gl, inp.shape);
			Run(IDENTITY, out, { image: inp, _activation: 'linear' })
			assEqual(out.read2(), arr)
		})
		it('yay floating point decoder', () => {
			var arr = ndpack([
				[53, 4], 
				[-1, 0]]),
				inp = new Tensor(gl, arr),
				out = new OutputTensor(gl, inp.shape);
			Run(IDENTITY, out, { image: inp, _activation: 'linear' })
			assEqual(out.read2(), arr)
		})
	})

	describe('relu', () => {
		it('should work for carefully chosen floats', () => {
			var inp = new Tensor(gl, ndpack([
				[5, 6], 
				[-3, 0]])),
				out = new OutputTensor(gl, inp.shape);
			Run(IDENTITY, out, { image: inp, _activation: 'relu' })
			assEqual(out.read2(), ndpack([
				[5, 6],
				[0, 0]]))
		})
		it('should work after logan fixes stuff', () => {
			var inp = new Tensor(gl, ndpack([
				[1, 2], 
				[-1, 0]])),
				out = new OutputTensor(gl, inp.shape);
			Run(IDENTITY, out, { image: inp, _activation: 'relu' })
			assEqual(out.read2(), ndpack([
				[1, 2],
				[0, 0]]))
		})
	})

	describe('sigmoid', () => {
		it('should work', () => {
			var inp = new Tensor(gl, ndpack([
				[53, 3], 
				[-32, 0]])),
				out = new OutputTensor(gl, inp.shape);
			Run(IDENTITY, out, { image: inp, _activation: 'sigmoid' })
			assEqual(out.read2(), ndpack([
				[1, 0.9975274205207825],
				[0, 0.5]]))
		})
	})

	describe('tanh', () => {
		it('should work', () => {
			var inp = new Tensor(gl, ndpack([
				[53, 3], 
				[-32, 0]])),
				out = new OutputTensor(gl, inp.shape);
			Run(IDENTITY, out, { image: inp, _activation: 'tanh' })

			assEqual(out.read2(), ndpack([
				[1, 0.9950547814369202],
				[-1, 0]]))
		})
	})


})
