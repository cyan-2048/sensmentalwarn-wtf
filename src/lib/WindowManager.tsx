import { Signal, signal } from "@preact/signals";
import { ComponentChildren, ComponentProps, createContext } from "preact";
import { PureComponent } from "preact/compat";
import { useCallback, useContext, useLayoutEffect } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";
import { Rnd, RndResizeCallback, Props as RndProps, RndDragCallback } from "react-rnd";
import XP from "../xp.css/XP.module.scss";
import { callMultiple } from "./utils";

export { XP };

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

function findTopWindow(id?: string): XPWindow | null {
	let top: XPWindow | null = null,
		index = 0;

	_windows.forEach((window) => {
		if (id && window.id !== id) return;
		if (!top) return (top = window);
		const currentnIndex = window._state.peek().index;
		if (currentnIndex > index) {
			top = window;
			index = currentnIndex;
		}
	});

	return top;
}

function findLargestIndex(id?: string) {
	let largest = findTopWindow(id);
	return largest?._state.peek().index || 0;
}

interface XPWindowState {
	x: number;
	y: number;
	width: number;
	height: number;

	minimized: boolean;

	// restore or maximize
	maximized: boolean;

	index: number;
	titleIcon: null | string;
	title: string;
}

export function createResizeCallback(window: XPWindow, minHeight = 50, minWidth = 50): RndResizeCallback {
	return useCallback((e, direction, ref, delta, position) => {
		const height = ref.offsetHeight,
			width = ref.offsetWidth;

		if (height < minHeight) {
			ref.style.height = ref.style.minHeight = minHeight + "px";
		} else {
			ref.style.minHeight = null;
		}

		if (width < minWidth) {
			ref.style.width = ref.style.minWidth = minWidth + "px";
		} else {
			ref.style.minWidth = null;
		}

		window.forwardWindow();

		window.updateState({
			width: width < minWidth ? minWidth : width,
			height: height < minHeight ? minHeight : height,
			...position,
		});
	}, []);
}

let shiftNumber = 1;

class XPWindow {
	component: JSX.Element;
	type: WindowType;
	id: string;

	_window_id: string;

	_state: Signal<XPWindowState>;

	constructor(component: JSX.Element, { title, minimized, maximized, id, type, ...props }: Partial<XPWindowInitProps>) {
		const topWindow = findTopWindow(id)?._state.peek(),
			topIndex = findLargestIndex();

		shiftNumber++;

		this._window_id = (+new Date() + shiftNumber).toString(36);

		this._state = signal({
			title: title ?? "untitled",
			titleIcon: props.titleIcon ?? null,

			x: props.x ?? 10 + (topWindow?.x || 0),
			y: props.y ?? 10 + (topWindow?.y || 0),

			width: props.width ?? 400,
			height: props.height ?? 400,

			minimized: minimized ?? false,
			maximized: maximized ?? false,

			index: topIndex + 1,
		});

		this.id = id ?? Math.random().toString(36).substr(2, 9);
		this.type = type;

		this.component = <XPWindowContext.Provider value={this}>{component}</XPWindowContext.Provider>;
	}

	_init: Partial<XPWindowInitProps>;

	init = (e: Partial<XPWindowInitProps>, cb?: () => void) => {
		if (this._init) return;
		this._init = e;
		this.updateState(e);
		cb?.();
	};

	state() {
		return this._state.value;
	}

	peek() {
		return this._state.peek();
	}

	close = () => {
		_windows.delete(this);
		windows.value = [..._windows];
	};

	updateState(props: Partial<XPWindowState>) {
		this._state.value = { ...this.peek(), ...props };
	}

	minimize = () => {
		this.updateState({ minimized: true });
	};

	unminimize = () => {
		this.updateState({ minimized: false });
	};

	maximizeToggle = () => {
		const toggled = !this.peek().maximized;
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

export function push(component: JSX.Element, props?: Partial<XPWindowInitProps>) {
	// @ts-ignore
	const window = new XPWindow(component, Object.assign(component.type.props || {}, props));

	_windows.add(window);
	windows.value = [..._windows];
	return window;
}

export function XPWindowBody(props: Omit<ComponentProps<"div">, "class" | "className">) {
	return <div {...props} class={XP["window-body"]} />;
}

export function initWindow(window: XPWindow, props: Partial<XPWindowInitProps>) {
	useLayoutEffect(() => window.updateState(props), []);
}

interface WrapperProps {
	children: ComponentChildren;
	minWidth?: number;
	minHeight?: number;
	rndProps?: Partial<RndProps>;
	onResize?: RndProps["onResize"];
	onResizeStop?: RndProps["onResizeStop"];
	onClose?: () => void;
	onDragStop?: RndProps["onDragStop"];
	onMouseDown?: RndProps["onMouseDown"];
	windowButons?: WindowButtons[];
	style?: JSX.CSSProperties;
}

export const enum WindowButtons {
	Minimize,
	Maximize,
	Restore,
	Close,
}

export function XPWindowWrapper(props: WrapperProps) {
	const window = useWindowContext();
	const { height, width, x, y, index, title, titleIcon, maximized } = window.state();

	const resizeCallback = createResizeCallback(window, props.minHeight ?? 200, props.minWidth ?? 300);

	const extraProps = props.rndProps || {};

	const closeWindow = callMultiple(window.close, props.onClose);
	const mousedownHandler = callMultiple(props.onMouseDown, window.forwardWindow);

	const buttons = props.windowButons ?? [WindowButtons.Minimize, WindowButtons.Maximize, WindowButtons.Close];

	const style = props.style ?? {};

	return (
		<Rnd
			{...extraProps}
			dragHandleClassName={XP["title-bar"]}
			size={{ width, height }}
			position={{ x, y }}
			onDragStop={callMultiple(props.onDragStop, (e, d) => window.updateState(d))}
			onResize={callMultiple(resizeCallback, props.onResize)}
			style={{
				zIndex: index,
			}}
			onResizeStop={callMultiple(resizeCallback, props.onResizeStop)}
			onMouseDown={mousedownHandler}
		>
			<div onMouseDown={mousedownHandler} onMouseDownCapture={mousedownHandler} style={{ ...style, width: width, height: height }} class={XP.window}>
				<div style={{ userSelect: "none" }} class={XP["title-bar"]}>
					<div style={{ paddingLeft: titleIcon && 19, position: titleIcon && "relative" }} class={XP["title-bar-text"]}>
						{titleIcon && <img style={{ pointerEvents: "none", position: "absolute", top: 1, left: 2 }} width={15} height={15} src={titleIcon} />}
						{title}
					</div>
					<div class={XP["title-bar-controls"]}>
						{buttons.map((button) => {
							if (button === WindowButtons.Restore || button === WindowButtons.Maximize) {
								return <button onClick={window.maximizeToggle} aria-label={maximized ? "Restore" : "Maximize"}></button>;
							}
							switch (button) {
								case WindowButtons.Close:
									return <button onClick={closeWindow} onTouchEnd={closeWindow} aria-label="Close"></button>;
								case WindowButtons.Minimize:
									return <button onClick={window.minimize} aria-label="Minimize"></button>;
							}
						})}
					</div>
				</div>
				{props.children}
			</div>
		</Rnd>
	);
}
