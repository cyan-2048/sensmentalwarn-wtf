import { useToggle } from "react-use";
import styles from "./Taskbar.module.scss";
import { clxArr } from "./lib/utils";
import { startMenuOpen, time, toggleStartMenu } from "./lib/WindowManager";

function StartButton() {
	return <button onClick={toggleStartMenu} class={clxArr(styles.start_button, startMenuOpen.value && styles.toggle)}></button>;
}

function ActiveWindows() {
	return <div class={styles.windows}></div>;
}

function SystemTray() {
	return (
		<div class={styles.sys_tray}>
			<div style={{ marginLeft: "auto" }}></div>
			<div class={styles.time}>
				{time.value.toLocaleString([], {
					hour: "numeric",
					minute: "numeric",
					hour12: true,
				})}
			</div>
		</div>
	);
}

export default function Taskbar() {
	return (
		<div class={styles.taskbar}>
			<StartButton />
			<ActiveWindows />
			<SystemTray />
		</div>
	);
}
