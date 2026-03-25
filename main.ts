import { Plugin } from 'obsidian';

export default class SimpleAIPlugin extends Plugin {
	async onload() {
		console.log('loading Simple AI plugin');
	}

	onunload() {
		console.log('unloading Simple AI plugin');
	}
}
