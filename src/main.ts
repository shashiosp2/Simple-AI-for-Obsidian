import { Plugin, Editor, MarkdownView, Notice } from 'obsidian';
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

		// Validate settings for current provider
		try {
			this.validateProviderSettings(this.settings.activeProvider);
		} catch (e: any) {
			new Notice(e.message);
			return;
		}

		const systemPrompt = this.settings.systemPrompt;
		const notice = new Notice(`Calling ${provider.name}...`, 0); // Permanent notice

		// Add a loading placeholder
		const cursor = activeEditor.getCursor('to');
		const lineCount = activeEditor.lineCount();
		const placeholder = '\n\n> [!info] Generating response... \n\n';
		
		if (useFullFile) {
			activeEditor.replaceRange(placeholder, { line: lineCount, ch: 0 });
		} else {
			activeEditor.replaceRange(placeholder, cursor);
		}

		try {
			const response = await provider.generateResponse(selection, systemPrompt);
			
			// Remove placeholder and insert response
			const startPos = useFullFile ? { line: lineCount, ch: 0 } : cursor;
			const endPos = activeEditor.offsetToPos(activeEditor.posToOffset(startPos) + placeholder.length);
			
			activeEditor.replaceRange(`\n\n${response}\n\n`, startPos, endPos);
			
			notice.hide();
			new Notice('AI response received.');
		} catch (error: any) {
			console.error('Simple AI Error:', error);
			// Remove placeholder on error
			const startPos = useFullFile ? { line: lineCount, ch: 0 } : cursor;
			const endPos = activeEditor.offsetToPos(activeEditor.posToOffset(startPos) + placeholder.length);
			activeEditor.replaceRange('', startPos, endPos);

			notice.hide();
			new Notice(`Error: ${error.message || error}`);
		}
	}

	validateProviderSettings(provider: string) {
		switch (provider) {
			case 'gemini':
				if (!this.settings.geminiApiKey) throw new Error('Gemini API Key is missing.');
				break;
			case 'groq':
				if (!this.settings.groqApiKey) throw new Error('Groq API Key is missing.');
				break;
			case 'claude':
				if (!this.settings.claudeApiKey) throw new Error('Claude API Key is missing.');
				break;
		}
	}
}
