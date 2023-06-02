export function clxArr(...classes: any[]) {
	return classes.filter((a) => Boolean(a) && typeof a == "string").join(" ");
}
