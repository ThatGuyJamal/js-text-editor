// Retrieve Elements from ace
const consoleLogList = document.querySelector(".editor__console-logs");
const executeCodeBtn = document.querySelector(".editor__run");
const resetCodeBtn = document.querySelector(".editor__reset");

// Setup Ace
let editor = ace.edit("editorCode");
let defaultCode = `console.log("Run some code!");`;
let consoleMessages = [];

let editorLib = {
	clearConsoleScreen() {
		consoleMessages.length = 0;

		// Remove all elements in the log list
		while (consoleLogList.firstChild) {
			consoleLogList.removeChild(consoleLogList.firstChild);
		}
	},
	printToConsole() {
		consoleMessages.forEach((log) => {
			const newLogItem = document.createElement("li");
			const newLogText = document.createElement("pre");

			newLogText.className = log.class;
			newLogText.textContent = `> ${log.message}`;

			newLogItem.appendChild(newLogText);

			consoleLogList.appendChild(newLogItem);
		});
	},
	init() {
		// Configure Ace
		// ! Docs (https://ace.c9.io/#nav=howto)

		// Theme
		editor.setTheme("ace/theme/twilight");

		// Set language
		editor.session.setMode("ace/mode/javascript");
		editor.setShowPrintMargin(false);
		// Set Options
		editor.setOptions({
			fontFamily: "Inconsolata",
			fontSize: "12pt",
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true,
			autoScrollEditorIntoView: true,
		});

		// Other settings
		editor.session.getLength();
		editor.selection.getCursor();
		editor.session.setTabSize(4);
		// Set Default Code & saved code to local storage
		editor.session.setValue(localStorage.savedValue || defaultCode);
		function save() {
			localStorage.savedValue = editor.getValue();
			editor.session.getUndoManager().markClean();
			updateToolbar();
		}

		//? Allows the user to (Ctrl + f) to search for items in the editor

		editor.find("needle", {
			backwards: true,
			wrap: false,
			caseSensitive: false,
			wholeWord: false,
			regExp: false,
			range: false,
			start: false,
			skipCurrent: false,
			preventScroll: false,
		});
		editor.findNext();
		editor.findPrevious();

		// ! WORK IN PROGRESS

		//? System to save on ctrl + s in local storage
		var refs = {};
		function updateToolbar() {
			refs.saveButton.disabled = editor.session.getUndoManager().isClean();
			refs.undoButton.disabled = !editor.session.getUndoManager().hasUndo();
			refs.redoButton.disabled = !editor.session.getUndoManager().hasRedo();
		}
		editor.on("input", updateToolbar);
		editor.session.setValue(
			localStorage.savedValue || "Welcome to ace Toolbar demo!"
		);
		function save() {
			localStorage.savedValue = editor.getValue();
			editor.session.getUndoManager().markClean();
			updateToolbar();
		}
		editor.commands.addCommand({
			name: "save",
			exec: save,
			bindKey: { win: "ctrl-s", mac: "cmd-s" },
		});
		var buildDom = require("ace/lib/dom").buildDom;
		buildDom(
			[
				"div",
				{ class: "toolbar" },
				[
					"button",
					{
						ref: "saveButton",
						onclick: save,
					},
					"save",
				],
				[
					"button",
					{
						ref: "undoButton",
						onclick: function () {
							editor.undo();
						},
					},
					"undo",
				],
				[
					"button",
					{
						ref: "redoButton",
						onclick: function () {
							editor.redo();
						},
					},
					"redo",
				],
			],
			document.body,
			refs
		);

		window.editor = editor;

		// editor.commands.addCommand({
		// 	name: "read_only_edit",
		// 	bindKey: { win: "Ctrl-r", mac: "Command-r" },
		// 	exec: function (editor) {
		// 		//...
		// 		if (editor) {
		// 			editor.setReadOnly(true);
		// 		}
		// 	},
		// 	readOnly: false, // false if this command should not apply in readOnly mode
		// });
	},
};

// Events
executeCodeBtn.addEventListener("click", () => {
	// Clear console messages
	editorLib.clearConsoleScreen();

	// Get input from the code editor
	const userCode = editor.getValue();

	// Run the user code
	try {
		new Function(userCode)();
	} catch (err) {
		console.error(err);
	}

	// Print to the console
	editorLib.printToConsole();
});

resetCodeBtn.addEventListener("click", () => {
	// Clear ace editor
	editor.setValue(defaultCode);

	// Clear console messages
	editorLib.clearConsoleScreen();
});

editorLib.init();
