import { Fragment, render } from "preact";

import Desktop from "./Desktop";
import Taskbar from "./Taskbar";
import { windows } from "@WindowManager";

function Windows() {
	return (
		<>
			{windows.value.map((window) => (
				<Fragment key={window._window_id}>{window.component}</Fragment>
			))}
		</>
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

/**
 * import polyfills manually
 */
import "core-js/actual/array/flat";
import "core-js/actual/array/find-last";
import "core-js/actual/array/to-sorted";
import "core-js/actual/string/match-all";

render(<App />, document.body);
