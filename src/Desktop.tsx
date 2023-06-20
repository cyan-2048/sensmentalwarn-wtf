import { desktopBackground } from "./lib/signals";
import wallpaper from "./assets/xp-wallpaper.jpg";

import styles from "./Desktop.module.scss";

import { useInterval, useMount } from "react-use";
import { clxArr } from "./lib/utils";
import { createResizeCallback, initWindow, push, useWindowContext, WindowButtons, XP, XPWindowBody, XPWindowWrapper } from "./lib/WindowManager";

import { Rnd, RndResizeCallback } from "react-rnd";

import { useCallback, useLayoutEffect, useState } from "preact/hooks";
import { Component } from "preact";

import ErrorWindow from "@apps/Error";
import Toolkit from "@apps/Toolkit";

export default function Desktop() {
	console.log(wallpaper);

	return (
		<div
			onClick={(e) => {
				e.currentTarget === e.target && push(<Toolkit />);
			}}
			class={clxArr(styles.desktop, XP.xp)}
			style={{ backgroundImage: `url(${desktopBackground.value || wallpaper})` }}
		></div>
	);
}
