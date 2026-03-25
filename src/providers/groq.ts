import { requestUrl } from 'obsidian';
import { AIProvider } from './provider';
import { SimpleAISettings } from '../settings';

export class GroqProvider implements AIProvider {
	id = 'groq';
	name = 'Groq';
	settings: SimpleAISettings;

	constructor(settings: SimpleAISettings) {
		this.settings = settings;
	}

	async generateResponse(prompt: string, systemPrompt: string): Promise<string> {
		const model = this.settings.groqModel;
		const apiKey = this.settings.groqApiKey;

		if (!apiKey) {
			throw new Error('Groq API Key is missing.');
		}

		const url = 'https://api.groq.com/openai/v1/chat/completions';

		const response = await requestUrl({
			url: url,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: prompt }
				]
			}),
		});

		if (response.status !== 200) {
			throw new Error(`Groq API Error: ${response.status} - ${response.text}`);
		}

		const data = response.json;
		return data.choices[0].message.content;
	}

	async fetchModels(): Promise<string[]> {
		const apiKey = this.settings.groqApiKey;
		if (!apiKey) return [];

		const url = 'https://api.groq.com/openai/v1/models';

		try {
			const response = await requestUrl({
				url: url,
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${apiKey}`
				}
			});

			if (response.status !== 200) return [];

			const data = response.json;
			return data.data.map((m: any) => m.id);
		} catch (error) {
			console.error('Error fetching Groq models:', error);
			return [];
		}
	}
}
