import { App, PluginSettingTab, Setting } from 'obsidian';
import SimpleAIPlugin from './main';

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

		containerEl.createEl('h3', { text: 'API Keys' });

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
			.setName('Groq API Key')
			.addText(text => text
				.setPlaceholder('Enter your Groq API key')
				.setValue(this.plugin.settings.groqApiKey)
				.onChange(async (value) => {
					this.plugin.settings.groqApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Claude API Key')
			.addText(text => text
				.setPlaceholder('Enter your Claude API key')
				.setValue(this.plugin.settings.claudeApiKey)
				.onChange(async (value) => {
					this.plugin.settings.claudeApiKey = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Models' });

		new Setting(containerEl)
			.setName('Gemini Model')
			.addText(text => text
				.setValue(this.plugin.settings.geminiModel)
				.onChange(async (value) => {
					this.plugin.settings.geminiModel = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Groq Model')
			.addText(text => text
				.setValue(this.plugin.settings.groqModel)
				.onChange(async (value) => {
					this.plugin.settings.groqModel = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Claude Model')
			.addText(text => text
				.setValue(this.plugin.settings.claudeModel)
				.onChange(async (value) => {
					this.plugin.settings.claudeModel = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Global' });

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
