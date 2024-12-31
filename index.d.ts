declare function mirrorOwn<
	T extends Record<PropertyKey, unknown> | unknown[] | Function | object,
	S extends Record<PropertyKey, unknown> | unknown[] | Function | object,
>(
	target: T,
	source: S,
	options?: {
		skipFailures?: boolean;
	},
): void;

export = mirrorOwn;
