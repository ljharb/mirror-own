'use strict';

var test = require('tape');
var hasOwn = require('hasown');
var hasProto = require('has-proto')();
var hasPropertyDescriptors = require('has-property-descriptors')();
var hasSymbols = require('has-symbols')();

var mirrorOwn = require('../');

test('mirrorOwn', function (t) {
	t.equal(typeof mirrorOwn, 'function', 'is a function');

	t.test('basics', function (st) {
		var a = { a: 1, b: 2 };
		var b = { c: 3 };

		st.deepEqual(b, { c: 3 }, 'precondition');

		mirrorOwn(a, b);

		st.deepEqual(a, { a: 1, b: 2 }, 'does not modify A');
		st.deepEqual(b, { a: 1, b: 2, c: 3 }, 'mirrors own properties from A to B');

		st.end();
	});

	t.test('non-enumerables', function (st) {
		var a = [1, 2, 3];
		var b = { __proto__: null };

		st.ok('length' in a, '`length` is in A');
		st.ok(hasOwn(a, 'length'), '`length` is own property of A');
		st.notOk(Object.prototype.propertyIsEnumerable.call(a, 'length'), '`length` is non-enumerable in A');

		st.deepEqual(b, { __proto__: null }, 'precondition');

		mirrorOwn(a, b);

		st.deepEqual(a, [1, 2, 3], 'does not modify A');
		st.deepEqual(b, { __proto__: null, 0: 1, 1: 2, 2: 3 }, 'mirrors non-enumerable properties');
		st.ok('length' in b, 'length` is in B');
		st.ok(hasOwn(b, 'length'), '`length` is own property of B');

		st.end();
	});

	t.test('inherited enumerables', { skip: !hasProto }, function (st) {
		var aP = { a: 1 };
		var a = { __proto__: aP, b: 2 };
		var b = { __proto__: null };

		st.deepEqual(a, { __proto__: aP, b: 2 }, 'precondition');
		st.deepEqual(b, { __proto__: null }, 'precondition');

		mirrorOwn(a, b);

		st.deepEqual(a, { __proto__: aP, b: 2 }, 'does not modify A');
		st.deepEqual(b, { __proto__: null, b: 2 }, 'mirrors own properties from A to B');
		st.notOk('a' in b, 'does not mirror inherited properties');

		st.end();
	});

	t.test('accessor properties', { skip: !hasPropertyDescriptors }, function (st) {
		var a = { a: 1 };
		Object.defineProperty(a, 'b', {
			configurable: true,
			enumerable: true,
			get: function () {
				return 2;
			}
		});

		var b = { __proto__: null };

		mirrorOwn(a, b);

		st.deepEqual(a, { a: 1, b: 2 }, 'does not modify A');
		st.deepEqual(b, { __proto__: null, a: 1, b: 2 }, 'mirrors own properties from A to B');
		st.deepEqual(
			// eslint-disable-next-line no-extra-parens
			typeof /** @type {PropertyDescriptor} */ (Object.getOwnPropertyDescriptor(b, 'b')).get,
			'function',
			'preserves accessor property state'
		);

		st.end();
	});

	t.test('symbols', { skip: !hasSymbols }, function (st) {
		var sym = Symbol('τ');
		/** @type {Record<PropertyKey, unknown>} */
		var a = { a: 1 };
		a[sym] = 2;

		var nonEnumSym = Symbol('💩');
		Object.defineProperty(a, nonEnumSym, {
			configurable: true,
			enumerable: false,
			value: 3
		});
		var b = { __proto__: null, b: 2 };

		/** @type {Record<PropertyKey, unknown>} */
		var expectedA = { a: 1 };
		expectedA[sym] = 2;
		st.deepEqual(a, expectedA, 'precondition');
		st.ok(nonEnumSym in a, 'non-enumerable symbol is in A');

		mirrorOwn(a, b);

		/** @type {Record<PropertyKey, unknown>} */
		var expectedB = { __proto__: null, a: 1, b: 2 };
		expectedB[sym] = 2;
		expectedB[nonEnumSym] = 3;
		st.deepEqual(b, expectedB, 'enumerable symbols are copied to B');
		st.ok(sym in b, 'enumerable symbol is in B');
		st.ok(nonEnumSym in b, 'non-enumerable symbol is in B');

		st.end();
	});

	t.end();
});
