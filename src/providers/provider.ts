import { SimpleAISettings } from '../settings';

export interface AIProvider {
	id: string;
	name: string;
	settings: SimpleAISettings;
	
	generateResponse(prompt: string, systemPrompt: string): Promise<string>;
	fetchModels(): Promise<string[]>;
}
