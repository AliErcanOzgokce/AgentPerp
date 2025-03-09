import OpenAI from 'openai';
import { CharacterConfig } from '../types/character';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generates a complete character configuration using OpenAI
 * @param name Agent name
 * @param bio Array of bio statements
 * @param lore Array of lore statements
 * @returns Complete character configuration
 */
export async function generateCharacterConfig(
    name: string,
    bio: string[],
    lore: string[]
): Promise<CharacterConfig> {
    try {
        const prompt = `
Given an AI agent with:
Name: ${name}
Bio: ${bio.join('\n')}
Lore: ${lore.join('\n')}

Create a complete character profile following EXACTLY this format and keeping these categories:
{
    "name": "${name}",
    "clients": ["twitter"],
    "modelProvider": "openai",
    "system": "...", // Generate based on bio and lore
    "settings": {
        "voice": {
            "model": "en_US-male-medium"
        }
    },
    "plugins": [],
    "bio": ${JSON.stringify(bio)},
    "lore": ${JSON.stringify(lore)},
    "knowledge": [...], // Generate relevant knowledge points
    "messageExamples": [...], // Generate 4 example conversations
    "postExamples": [...], // Generate 10 example posts
    "topics": [...], // Generate 25 relevant topics
    "style": {
        "all": [...], // Generate 18 style points
        "chat": [...], // Generate 10 chat styles
        "post": [...] // Generate 10 post styles
    },
    "adjectives": [...] // Generate 26 relevant adjectives
}

Important:
1. Maintain EXACT format and structure
2. Keep ALL categories
3. No empty arrays
4. Generate high-quality, detailed content similar to SpinorBot
5. Ensure valid JSON format
6. Make content contextually relevant to the agent's purpose
7. Keep system prompt concise but descriptive
8. Generate realistic conversation examples
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are a character profile generator for AI agents. Generate detailed, contextually relevant content while maintaining exact JSON structure."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        const response = completion.choices[0].message.content;
        if (!response) {
            throw new Error("No response from OpenAI");
        }

        // Parse and validate the response
        const config = JSON.parse(response) as CharacterConfig;
        validateCharacterConfig(config);

        return config;
    } catch (error) {
        console.error("Error generating character config:", error);
        throw error;
    }
}

/**
 * Validates the character configuration structure
 * @param config Character configuration to validate
 * @throws Error if configuration is invalid
 */
function validateCharacterConfig(config: CharacterConfig): void {
    const requiredFields = [
        'name',
        'clients',
        'modelProvider',
        'system',
        'settings',
        'plugins',
        'bio',
        'lore',
        'knowledge',
        'messageExamples',
        'postExamples',
        'topics',
        'style',
        'adjectives'
    ];

    for (const field of requiredFields) {
        if (!(field in config)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Validate arrays are not empty
    const arrayFields = [
        'clients',
        'bio',
        'lore',
        'knowledge',
        'messageExamples',
        'postExamples',
        'topics',
        'adjectives'
    ];

    for (const field of arrayFields) {
        if (!Array.isArray(config[field as keyof CharacterConfig]) || 
            (config[field as keyof CharacterConfig] as any[]).length === 0) {
            throw new Error(`Field ${field} must be a non-empty array`);
        }
    }

    // Validate style object
    if (!config.style || 
        !config.style.all || 
        !config.style.chat || 
        !config.style.post ||
        config.style.all.length === 0 ||
        config.style.chat.length === 0 ||
        config.style.post.length === 0) {
        throw new Error('Invalid style configuration');
    }

    // Validate specific array lengths
    if (config.messageExamples.length < 4) {
        throw new Error('Requires at least 4 message examples');
    }
    if (config.postExamples.length < 10) {
        throw new Error('Requires at least 10 post examples');
    }
    if (config.topics.length < 25) {
        throw new Error('Requires at least 25 topics');
    }
    if (config.adjectives.length < 26) {
        throw new Error('Requires at least 26 adjectives');
    }
} 