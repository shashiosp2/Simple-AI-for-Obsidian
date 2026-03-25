import { requestUrl } from 'obsidian';
import { AIProvider } from './provider';
import { SimpleAISettings } from '../settings';

export class GeminiProvider implements AIProvider {
	id = 'gemini';
	name = 'Google Gemini';
	settings: SimpleAISettings;

	constructor(settings: SimpleAISettings) {
		this.settings = settings;
	}

	async generateResponse(prompt: string, systemPrompt: string): Promise<string> {
		const model = this.settings.geminiModel;
		const apiKey = this.settings.geminiApiKey;

		if (!apiKey) {
			throw new Error('Gemini API Key is missing.');
		}

		const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

		const response = await requestUrl({
			url: url,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contents: [
					{
						role: 'user',
						parts: [{ text: `${systemPrompt}\n\n${prompt}` }]
					}
				]
			}),
		});

		if (response.status !== 200) {
			throw new Error(`Gemini API Error: ${response.status} - ${response.text}`);
		}

		const data = response.json;
		return data.candidates[0].content.parts[0].text;
	}

	async fetchModels(): Promise<string[]> {
		const apiKey = this.settings.geminiApiKey;
		if (!apiKey) return [];

		const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

		try {
			const response = await requestUrl({
				url: url,
				method: 'GET',
			});

			if (response.status !== 200) return [];

			const data = response.json;
			return data.models
				.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
				.map((m: any) => m.name.replace('models/', ''));
		} catch (error) {
			console.error('Error fetching Gemini models:', error);
			return [];
		}
	}
}
