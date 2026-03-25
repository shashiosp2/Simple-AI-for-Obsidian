import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import SimpleAIPlugin from './main';
import { GeminiProvider, GroqProvider, ClaudeProvider } from './providers';

export interface SimpleAISettings {
	geminiApiKey: string;
	groqApiKey: string;
	claudeApiKey: string;
	activeProvider: 'gemini' | 'groq' | 'claude';
	geminiModel: string;
	groqModel: string;
	claudeModel: string;
	systemPrompt: string;
}

export const DEFAULT_SETTINGS: SimpleAISettings = {
	geminiApiKey: '',
	groqApiKey: '',
	claudeApiKey: '',
	activeProvider: 'gemini',
	geminiModel: 'gemini-1.5-flash',
	groqModel: 'llama-3.1-70b-versatile',
	claudeModel: 'claude-3-5-sonnet-latest',
	systemPrompt: 'You are a helpful assistant.'
}

export class SimpleAISettingTab extends PluginSettingTab {
	plugin: SimpleAIPlugin;

	constructor(app: App, plugin: SimpleAIPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for Simple AI' });

		new Setting(containerEl)
			.setName('Active Provider')
			.setDesc('Select which AI provider to use.')
			.addDropdown(dropdown => dropdown
				.addOption('gemini', 'Google Gemini')
				.addOption('groq', 'Groq')
				.addOption('claude', 'Anthropic Claude')
				.setValue(this.plugin.settings.activeProvider)
				.onChange(async (value) => {
					this.plugin.settings.activeProvider = value as 'gemini' | 'groq' | 'claude';
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Gemini Settings' });

		new Setting(containerEl)
			.setName('Gemini API Key')
			.addText(text => text
				.setPlaceholder('Enter your Gemini API key')
				.setValue(this.plugin.settings.geminiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.geminiApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Gemini Model')
			.setDesc('The model to use for Gemini.')
			.addText(text => text
				.setValue(this.plugin.settings.geminiModel)
				.onChange(async (value) => {
					this.plugin.settings.geminiModel = value;
					await this.plugin.saveSettings();
				}))
			.addButton(button => button
				.setButtonText('Fetch Models')
				.onClick(async () => {
					const provider = new GeminiProvider(this.plugin.settings);
					try {
						const models = await provider.fetchModels();
						if (models.length > 0) {
							new Notice(`Fetched ${models.length} Gemini models.`);
							// Ideally pop up a search/select modal, but for simplicity let's just log or show a notice
							console.log('Gemini Models:', models);
						} else {
							new Notice('No models found. Check your API key.');
						}
					} catch (e) {
						new Notice('Error fetching models.');
					}
				}));

		containerEl.createEl('h3', { text: 'Groq Settings' });

		new Setting(containerEl)
			.setName('Groq API Key')
			.addText(text => text
				.setPlaceholder('Enter your Groq API key')
				.setValue(this.plugin.settings.groqApiKey)
				.onChange(async (value) => {
					this.plugin.settings.groqApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Groq Model')
			.setDesc('The model to use for Groq.')
			.addText(text => text
				.setValue(this.plugin.settings.groqModel)
				.onChange(async (value) => {
					this.plugin.settings.groqModel = value;
					await this.plugin.saveSettings();
				}))
			.addButton(button => button
				.setButtonText('Fetch Models')
				.onClick(async () => {
					const provider = new GroqProvider(this.plugin.settings);
					try {
						const models = await provider.fetchModels();
						if (models.length > 0) {
							new Notice(`Fetched ${models.length} Groq models.`);
							console.log('Groq Models:', models);
						} else {
							new Notice('No models found. Check your API key.');
						}
					} catch (e) {
						new Notice('Error fetching models.');
					}
				}));

		containerEl.createEl('h3', { text: 'Claude Settings' });

		new Setting(containerEl)
			.setName('Claude API Key')
			.addText(text => text
				.setPlaceholder('Enter your Claude API key')
				.setValue(this.plugin.settings.claudeApiKey)
				.onChange(async (value) => {
					this.plugin.settings.claudeApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Claude Model')
			.setDesc('The model to use for Claude.')
			.addText(text => text
				.setValue(this.plugin.settings.claudeModel)
				.onChange(async (value) => {
					this.plugin.settings.claudeModel = value;
					await this.plugin.saveSettings();
				}))
			.addButton(button => button
				.setButtonText('Get Default Models')
				.onClick(async () => {
					const provider = new ClaudeProvider(this.plugin.settings);
					const models = await provider.fetchModels();
					new Notice(`Common Claude models: ${models.join(', ')}`);
					console.log('Claude Models:', models);
				}));

		containerEl.createEl('h3', { text: 'Global Settings' });

		new Setting(containerEl)
			.setName('System Prompt')
			.setDesc('Default personality/instructions for the AI.')
			.addTextArea(text => text
				.setPlaceholder('You are a helpful assistant.')
				.setValue(this.plugin.settings.systemPrompt)
				.onChange(async (value) => {
					this.plugin.settings.systemPrompt = value;
					await this.plugin.saveSettings();
				}));
	}
}
