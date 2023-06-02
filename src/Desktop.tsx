import { desktopBackground } from "./lib/signals";
import wallpaper from "./assets/xp-wallpaper.jpg";

import styles from "./Desktop.module.scss";
import XP from "./xp.css/XP.module.scss";

import { useInterval } from "react-use";
import { clxArr } from "./lib/utils";
import { push, useWindowContext } from "./lib/WindowManager";

import { Rnd } from "react-rnd";

import { useCallback, useState } from "preact/hooks";

function ErrorWindow() {
	const window = useWindowContext();
	const { height, width, x, y, index } = window.state.value;

	const resizeCallback = useCallback((e: MouseEvent, direction, ref, delta, position) => {
		const height = ref.offsetHeight;

		if (height < 200) {
			ref.style.height = ref.style.maxHeight = "200px";
			ref.style.pointerEvents = "none";
			setTimeout(() => {
				ref.style.pointerEvents = null;
			}, 0);
		} else {
			ref.style.maxHeight = ref.style.pointerEvents = null;
		}

		window.updateState({
			width: ref.offsetWidth,
			height: height < 200 ? 200 : height,
			...position,
		});
	}, []);

	return (
		<Rnd
			dragHandleClassName={XP["title-bar"]}
			size={{ width: width, height: height }}
			position={{ x, y }}
			onDragStop={(e, d) => {
				window.updateState(d);
			}}
			onResize={resizeCallback}
			style={{
				zIndex: index,
			}}
			onResizeStop={resizeCallback}
			onMouseDown={window.forwardWindow}
		>
			<div style={{ width: width, height: height }} class={XP.window}>
				<div class={XP["title-bar"]}>
					<div class={XP["title-bar-text"]}>A Window With Stuff In It</div>
					<div class={XP["title-bar-controls"]}>
						<button aria-label="Minimize"></button>
						<button aria-label="Restore"></button>
						<button onClick={window.close} onTouchEnd={window.close} aria-label="Close"></button>
					</div>
				</div>
				<div class={XP["window-body"]}>
					<p>There's so much room for activities!</p>
				</div>
			</div>
		</Rnd>
	);
}

export default function Desktop() {
	console.log(wallpaper);

	return (
		<div
			onClick={(e) => {
				e.currentTarget === e.target && push(<ErrorWindow />, { title: "Error", width: 300, height: 200 });
			}}
			class={clxArr(styles.desktop, XP.xp)}
			style={{ backgroundImage: `url(${desktopBackground.value || wallpaper})` }}
		></div>
	);
}
