export interface Agent {
    _id: string;
    agentName: string;
    instructions: string;
    codeSnippet?: string;
}