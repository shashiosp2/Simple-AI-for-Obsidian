import { Plugin } from 'obsidian';
import { SimpleAISettings, DEFAULT_SETTINGS, SimpleAISettingTab } from './settings';

export default class SimpleAIPlugin extends Plugin {
	settings!: SimpleAISettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SimpleAISettingTab(this.app, this));

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
}
