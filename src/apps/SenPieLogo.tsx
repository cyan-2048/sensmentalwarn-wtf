import { WindowButtons, XPWindowBody, XPWindowWrapper, useWindowContext, windows } from "@WindowManager";

import senpie1 from "@assets/senpie_logo1.png";
import senpie2 from "@assets/senpie_logo2.png";
import { useState } from "preact/hooks";
import { useMount } from "react-use";

export default function SenPieLogo() {
	const window = useWindowContext();

	window.init({
		title: "SenPie",
		width: 226,
		height: 248,
	});

	const [state, setState] = useState(() => windows.peek().length % 2 === 0);

	useMount(() => {
		console.log("MOUNTED");
	});

	return (
		<XPWindowWrapper
			rndProps={{
				enableResizing: false,
			}}
			windowButons={[WindowButtons.Close]}
		>
			<div
				onClick={() => setState((a) => !a)}
				style={{
					width: 220,
					height: 220,
					margin: "0 3px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundImage: `url(${state ? senpie1 : senpie2})`,
				}}
			></div>
		</XPWindowWrapper>
	);
}
