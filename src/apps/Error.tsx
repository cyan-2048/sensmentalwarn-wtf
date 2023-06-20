import { useState } from "preact/hooks";
import { useWindowContext, initWindow, XPWindowWrapper, WindowButtons } from "@WindowManager";
import error16x16 from "@assets/error16x16.png";
import error30x30 from "@assets/error30x30.png";
import errorWav from "@assets/error.wav";

import styles from "./Error.module.scss";
import { useMount } from "react-use";

function ErrorWindow() {
	const window = useWindowContext();

	window.init(
		{
			title: "Error",
			width: 380,
			height: 123,
			titleIcon: error16x16,
		},
		() => {
			window.id = "error";
		}
	);

	useMount(() => {
		new Audio(errorWav).play();
	});

	return (
		<XPWindowWrapper style={{ userSelect: "none" }} rndProps={{ enableResizing: false }} windowButons={[WindowButtons.Close]}>
			<div class={styles.main}>
				<div class={styles.top}>
					<img src={error30x30} />
					<div>
						<div>Hewo :3</div>
						<div>THIS WEBSITE IS A WORK IN PROGRESS</div>
					</div>
				</div>

				<div class={styles.button_wrapper}>
					<button onClick={window.close}>OK</button>
				</div>
			</div>
		</XPWindowWrapper>
	);
}

export default ErrorWindow;
