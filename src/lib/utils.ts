export function clxArr(...classes: any[]) {
	return classes.filter((a) => Boolean(a) && typeof a == "string").join(" ");
}

export function callMultiple<T extends Function>(...funcs: T[]): T {
	return ((...args: any[]) => {
		funcs.forEach((func) => func?.(...args));
	}) as any;
}
