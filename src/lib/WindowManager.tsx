import { Signal, signal } from "@preact/signals";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";

export const startMenuOpen = signal(false);

export const toggleStartMenu = () => (startMenuOpen.value = !startMenuOpen.peek());

export const time = signal(new Date());

function tick() {
	time.value = new Date();
}

setTimeout(function () {
	setInterval(tick, 60000);
	tick();
}, (60 - time.peek().getSeconds()) * 1000);

const XPWindowContext = createContext<XPWindow | null>(null);

const enum WindowType {
	"normal",
	"modal",
	/* modal assigned to a different window ID */
	"modalID",
}

interface XPWindowInitProps {
	title: string;
	minimized: boolean;
	maximized: boolean;

	titleIcon: string;

	x: number;
	y: number;
	width: number;
	height: number;

	index: number;
	id: string;
	type: WindowType;
}

function findTopWindow(): XPWindow | null {
	let top: XPWindow | null = null,
		index = 0;

	_windows.forEach((window) => {
		if (!top) return (top = window);
		const currentnIndex = window.state.peek().index;
		if (currentnIndex > index) {
			top = window;
			index = currentnIndex;
		}
	});

	return top;
}

function findLargestIndex() {
	let largest = findTopWindow();
	return largest?.state.peek().index || 0;
}

interface XPWindowState {
	x: number;
	y: number;
	width: number;
	height: number;

	minimized: boolean;
	maximized: boolean;

	index: number;
	titleIcon: null | string;
	title: string;
}

class XPWindow {
	component: JSX.Element;
	type: WindowType;
	id: string;

	state: Signal<XPWindowState>;

	constructor(component: JSX.Element, { title, minimized, maximized, id, type, ...props }: Partial<XPWindowInitProps>) {
		const topWindow = findTopWindow()?.state.peek();

		this.state = signal({
			title: title ?? "untitled",
			titleIcon: props.titleIcon ?? null,

			x: props.x ?? 10 + (topWindow?.x || 0),
			y: props.y ?? 10 + (topWindow?.y || 0),

			width: props.width ?? 400,
			height: props.height ?? 400,

			minimized: minimized ?? false,
			maximized: maximized ?? false,

			index: (topWindow?.index || 0) + 1,
		});

		this.id = id ?? Math.random().toString(36).substr(2, 9);
		this.type = type;

		this.component = <XPWindowContext.Provider value={this}>{component}</XPWindowContext.Provider>;
	}

	close = () => {
		_windows.delete(this);
		windows.value = [..._windows];
	};

	updateState(props: Partial<XPWindowState>) {
		this.state.value = { ...this.state.peek(), ...props };
	}

	minimize = () => {
		this.updateState({ minimized: true });
	};

	unminimize = () => {
		this.updateState({ minimized: false });
	};

	maximizeToggle = () => {
		const toggled = !this.state.peek().maximized;
		this.updateState({ maximized: toggled });
	};

	forwardWindow = () => {
		this.updateState({ index: findLargestIndex() + 1 });
	};
}

export function useWindowContext() {
	return useContext(XPWindowContext);
}

const _windows = new Set<XPWindow>();

export const windows = signal<XPWindow[]>([]);

export function push(component: JSX.Element, props: Partial<XPWindowInitProps>) {
	const window = new XPWindow(component, props);

	_windows.add(window);
	windows.value = [..._windows];
	return window;
}
