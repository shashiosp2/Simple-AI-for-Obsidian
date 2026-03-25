import { Plugin, Editor, MarkdownView, Notice, addIcon } from 'obsidian';
import { SimpleAISettings, DEFAULT_SETTINGS, SimpleAISettingTab } from './settings';
import { AIProvider, GeminiProvider, GroqProvider, ClaudeProvider } from './providers';

export default class SimpleAIPlugin extends Plugin {
	settings!: SimpleAISettings;

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new SimpleAISettingTab(this.app, this));

		// Add ribbon icon
		this.addRibbonIcon('sparkles', 'Simple AI: Process Selection', () => {
			this.processSelection();
		});

		// Add command to palette
		this.addCommand({
			id: 'process-selection',
			name: 'Process Selection',
			editorCallback: (editor: Editor) => {
				this.processSelection(editor);
			}
		});

		console.log('loading Simple AI plugin');
	}

	onunload() {
		console.log('unloading Simple AI plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getProvider(): AIProvider {
		switch (this.settings.activeProvider) {
			case 'gemini':
				return new GeminiProvider(this.settings);
			case 'groq':
				return new GroqProvider(this.settings);
			case 'claude':
				return new ClaudeProvider(this.settings);
			default:
				throw new Error('Unknown AI provider selected.');
		}
	}

	async processSelection(editor?: Editor) {
		const activeEditor = editor || this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		
		if (!activeEditor) {
			new Notice('No active editor found.');
			return;
		}

		let selection = activeEditor.getSelection();
		let useFullFile = false;

		if (!selection) {
			selection = activeEditor.getValue();
			useFullFile = true;
			new Notice('No selection found, processing entire file...');
		}

		const provider = this.getProvider();
		const systemPrompt = this.settings.systemPrompt;

		new Notice(`Calling ${provider.name}...`);

		try {
			const response = await provider.generateResponse(selection, systemPrompt);
			
			if (useFullFile) {
				// Append to the end of the file
				const lineCount = activeEditor.lineCount();
				activeEditor.replaceRange(`\n\n---\n\n${response}`, { line: lineCount, ch: 0 });
			} else {
				// Insert after selection
				const cursor = activeEditor.getCursor('to');
				activeEditor.replaceRange(`\n\n${response}`, cursor);
			}
			
			new Notice('AI response received.');
		} catch (error: any) {
			console.error('Simple AI Error:', error);
			new Notice(`Error: ${error.message || error}`);
		}
	}
}
