import { requestUrl } from 'obsidian';
import { AIProvider } from './provider';
import { SimpleAISettings } from '../settings';

export class ClaudeProvider implements AIProvider {
	id = 'claude';
	name = 'Anthropic Claude';
	settings: SimpleAISettings;

	constructor(settings: SimpleAISettings) {
		this.settings = settings;
	}

	async generateResponse(prompt: string, systemPrompt: string): Promise<string> {
		const model = this.settings.claudeModel;
		const apiKey = this.settings.claudeApiKey;

		if (!apiKey) {
			throw new Error('Claude API Key is missing.');
		}

		const url = 'https://api.anthropic.com/v1/messages';

		const response = await requestUrl({
			url: url,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: model,
				max_tokens: 4096,
				system: systemPrompt,
				messages: [
					{ role: 'user', content: prompt }
				]
			}),
		});

		if (response.status !== 200) {
			throw new Error(`Claude API Error: ${response.status} - ${response.text}`);
		}

		const data = response.json;
		return data.content[0].text;
	}

	async fetchModels(): Promise<string[]> {
		// Anthropic recently added a models endpoint, but we'll stick to a list of popular ones
		// as per the plan's hybrid approach, or try to fetch if possible.
		// For now, let's return a list of common ones.
		return [
			'claude-3-5-sonnet-latest',
			'claude-3-5-sonnet-20241022',
			'claude-3-5-sonnet-20240620',
			'claude-3-5-haiku-latest',
			'claude-3-5-haiku-20241022',
			'claude-3-opus-latest',
			'claude-3-opus-20240229',
			'claude-3-sonnet-20240229',
			'claude-3-haiku-20240307'
		];
	}
}
