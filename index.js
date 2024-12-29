'use strict';

var defineDataProperty = require('define-data-property');
var defineAccessorProperty = require('define-accessor-property');
var gOPD = require('gopd');
var ownKeys = require('own-keys');

/** @type {import('.')} */
module.exports = gOPD
	? function mirrorOwn(from, to) {
		var keys = ownKeys(from);
		for (var i = 0; i < keys.length; i += 1) {
			var k = keys[i];
			// eslint-disable-next-line no-extra-parens
			var desc = /** @type {PropertyDescriptor} */ (/** @type {NonNullable<typeof gOPD>} */ (gOPD)(from, k));
			if ('writable' in desc) {
				defineDataProperty(
					// eslint-disable-next-line no-extra-parens
					/** @type {Parameters<typeof defineDataProperty>[0]} */ (to),
					k,
					desc.value,
					!desc.enumerable,
					!desc.configurable,
					!desc.writable,
					true
				);
			} else {
				defineAccessorProperty(
					// eslint-disable-next-line no-extra-parens
					/** @type {Parameters<typeof defineAccessorProperty>[0]} */ (to),
					k,
					{
						nonEnumerable: !desc.enumerable,
						nonConfigurable: !desc.configurable,
						// eslint-disable-next-line no-extra-parens
						get: /** @type {NonNullable<typeof desc.get>} */ (desc.get),
						// eslint-disable-next-line no-extra-parens
						set: /** @type {NonNullable<typeof desc.set>} */ (desc.set),
						loose: true
					}
				);
			}
		}
	}
	: function mirrorOwn(from, to) {
		var keys = ownKeys(from);
		for (var i = 0; i < keys.length; i += 1) {
			var k = keys[i];
			// @ts-expect-error no idea how to fix this one
			to[k] = from[k]; // eslint-disable-line no-param-reassign
		}
	};