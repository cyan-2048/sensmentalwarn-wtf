import { WindowButtons, XPWindowBody, XPWindowWrapper, push, useWindowContext, windows } from "@WindowManager";
import ErrorWindow from "./Error";
import { useMemo } from "preact/hooks";
import SenPieLogo from "./SenPieLogo";

export default function Toolkit() {
	const window = useWindowContext();

	const id = useMemo(() => "toolkit" + Math.random().toString(36).substring(7), []);

	window.init(
		{
			title: "Toolkit",
			width: 380,
			height: 240,
		},
		() => {
			window.id = id;
		}
	);

	return (
		<XPWindowWrapper rndProps={{ enableResizing: false }} windowButons={[WindowButtons.Close]}>
			<XPWindowBody>
				<button
					onClick={() => {
						push(<ErrorWindow />, { id: "error" });
					}}
				>
					Open Error Window
				</button>
				<button
					onClick={() => {
						push(<SenPieLogo />, { id: "senpie" });
					}}
				>
					Open SenPie Logo
				</button>
				<button
					onClick={() => {
						windows.peek().forEach((w) => {
							if (w.id !== id) w.close();
						});
					}}
				>
					Close All Windows
				</button>
			</XPWindowBody>
		</XPWindowWrapper>
	);
}
