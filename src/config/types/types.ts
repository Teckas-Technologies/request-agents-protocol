export interface Agent {
    _id: string;
    agentName: string;
    instructions: string;
    codeSnippet?: string;
}

export interface Message {
    role: "ai" | "human";
    content: string;
    requestId?: string;
}