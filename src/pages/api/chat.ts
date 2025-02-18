import { NextApiRequest, NextApiResponse } from 'next';
// import { connectToDatabase } from '@/lib/mongodb';
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { createRequestTool, fetchRequestsTool } from '@/tools/tools';

const tools = [createRequestTool, fetchRequestsTool];
const toolNode = new ToolNode(tools);

// Create a model and bind it to tools
const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY
}).bindTools(tools);

// Initialize memory to persist states between runs
const checkpointer = new MemorySaver();


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { agentId, userId, query } = req.body;

    if (!agentId || !userId || !query) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {

        // Define decision function for the workflow
        function shouldContinue(state: { messages: (AIMessage | HumanMessage | SystemMessage)[] }) {
            const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

            if (lastMessage.tool_calls?.length) {
                return "tools"; // If tools were called, go to tools node
            }
            return "__end__"; // Otherwise, stop execution
        }

        // Function to invoke the AI model
        async function callModel(state: { messages: (AIMessage | HumanMessage | SystemMessage)[] }) {
            const systemMessage = new SystemMessage("You are an assistant for helping users interact with Request Network Protocol Invoicing activities. Use the createRequest tool to create an invoice. Use fetchRequests tool to fetch the invoices for the user.");
            const response = await model.invoke([systemMessage, ...state.messages], { configurable: { thread_id: "42" } });
            return { messages: [...state.messages, response] };
        }

        // Define LangGraph Workflow
        const workflow = new StateGraph(MessagesAnnotation)
            .addNode("agent", callModel)
            .addEdge("__start__", "agent") // Start point
            .addNode("tools", toolNode)
            .addEdge("tools", "agent") // Tool execution leads back to agent
            .addConditionalEdges("agent", shouldContinue);

        // Compile into a runnable app
        const app = workflow.compile({ checkpointer: checkpointer });

        // Execute the agent with the user's query
        const finalState = await app.invoke({
            messages: [new HumanMessage(query)],
        }, { configurable: { thread_id: "42" } },);

        const messages = finalState.messages;
        if (!messages || messages.length === 0) {
            return res.status(200).json({ lastAiMessage: null, lastToolMessage: null });
        }

        // Get the last message
        const lastMessage = messages[messages.length - 1];

        let lastAiMessageContent: string | null = null;
        let lastToolMessageData: any | null = null;

        if (lastMessage instanceof AIMessage) {
            // If the last message is AI, return its content
            lastAiMessageContent = lastMessage.lc_kwargs?.content ?? null;

            // Check if the previous message is a ToolMessage
            const lastToolIndex = messages.length - 2;
            if (lastToolIndex >= 0 && messages[lastToolIndex] instanceof ToolMessage) {
                const toolMessage = messages[lastToolIndex] as ToolMessage;
                lastToolMessageData = toolMessage.content || null;
            }
        } else if (lastMessage instanceof ToolMessage) {
            // If the last message is a ToolMessage, find the previous AI message
            const toolMessage = lastMessage as ToolMessage;
            lastToolMessageData = toolMessage.content || null;

            const lastAiMessage = [...messages]
                .reverse()
                .find((msg) => msg instanceof AIMessage) as AIMessage | undefined;

            if (lastAiMessage) {
                lastAiMessageContent = lastAiMessage.lc_kwargs?.content ?? null;
            }
        }

        return res.status(200).json({
            lastAiMessage: lastAiMessageContent,
            lastToolMessage: lastToolMessageData || null
        });

    } catch (err) {
        console.error('Error chatting with agent:', err);
        return res.status(500).json({ error: 'Failed to process request' });
    }
}