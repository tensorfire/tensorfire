import assert from 'assert'
import TNSL from '../src/tnsl.js'

describe('TNSL', function() {
	it('should pass through regular strings', function() {
		assert.equal(TNSL('hello world')({}), 'hello world');
		assert.equal(TNSL('hello #doge')({}), 'hello #doge');
		assert.equal(TNSL('hello (wat)')({}), 'hello (wat)');
	});

	it('should throw for missing uniform', function() {
		assert.throws(e => TNSL('hello #(cat)')({  }) );
	});

	it('should throw for string uniform', function() {
		assert.throws(e => TNSL('hello #(cat)')({ cat: "sadjfoi" }) );
	});

	describe('flat', function(){
		it('should substitute numbers', function() {
			assert.equal(TNSL('hello #(cat)')({ cat: 42 }), 'hello 42');
		});

		it('should substitute ivec3', function() {
			assert.equal(TNSL('hello #(cat)')({ cat: [1, 0, 2] }), 'hello ivec3(1,0,2)');
		});

		it('should substitute vec3', function() {
			assert.equal(TNSL('hello #(cat)')({ cat: [1.1, 0, 2] }), 'hello vec3(1.1,0,2)');
		});
	})

	describe('nested', function(){
		it('should substitute numbers', function() {
			assert.equal(TNSL('hello #(cat.shape)')({ cat: {shape: 42} }), 'hello 42');
		});

		it('should substitute ivec3', function() {
			assert.equal(TNSL('hello #(cat.shape)')({ cat: {shape: [1, 0, 2]} }), 'hello ivec3(1,0,2)');
		});

		it('should substitute vec3', function() {
			assert.equal(TNSL('hello #(cat.shape)')({ cat: {shape: [1.1, 0, 2]} }), 'hello vec3(1.1,0,2)');
		});
	})
});
