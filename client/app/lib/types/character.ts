export interface CharacterConfig {
    name: string;
    clients: string[];
    modelProvider: string;
    system: string;
    settings: {
        voice: {
            model: string;
        };
    };
    plugins: any[];
    bio: string[];
    lore: string[];
    knowledge: string[];
    messageExamples: MessageExample[];
    postExamples: string[];
    topics: string[];
    style: {
        all: string[];
        chat: string[];
        post: string[];
    };
    adjectives: string[];
}

export interface MessageExample {
    user: {
        user: string;
        content: {
            text: string;
        };
    };
    agent: {
        user: string;
        content: {
            text: string;
        };
    };
} 