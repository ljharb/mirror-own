declare function mirrorOwn<
	T extends Record<PropertyKey, unknown> | unknown[],
	S extends Record<PropertyKey, unknown> | unknown[],
>(
	target: T,
	source: S,
): void;

export = mirrorOwn;
