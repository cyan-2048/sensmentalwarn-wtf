import XP from "./xp.css/XP.module.scss";
import Desktop from "./Desktop";
import Taskbar from "./Taskbar";
import { windows } from "./lib/WindowManager";

function Windows() {
	return (
		<div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: 0 }} class={XP.xp}>
			{windows.value.map((window) => window.component)}
		</div>
	);
}

export function App() {
	return (
		<main style={{ width: "100vw", height: "100vh" }}>
			<Desktop />
			<Windows />
			<Taskbar />
		</main>
	);
}
