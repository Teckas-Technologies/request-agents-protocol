import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { createRequestTool, fetchRequestsTool } from '@/tools/tools';
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchAgents } from "@/db_utils/agentUtils";

// export interface createRequestToolParams {
//     recipientAddress: string,
//     currency: string,
//     amount: string,
//     reason: string
// }


// const createRequest = async ({ recipientAddress, currency, amount, reason }: createRequestToolParams) => {
//     try {
//         console.log(recipientAddress, currency, amount, reason);

//         const data = {
//             recipientAddress,
//             currency,
//             amount,
//             reason,
//         };

//         return { success: true, type: "create", data };
//     } catch (err) {
//         console.error(err); // Log error for debugging
//         return { success: false, data: null };
//     }
// };

// const fetchRequests = async ({ address }: { address: `0x${string}` }) => {
//     try {
//         const data = {
//             address
//         }
//         return { success: true, type: "fetch", data };
//     } catch (err) {
//         console.log("Error while fetching requests:", err);
//         return { success: false, data: null }
//     }
// };

// enum ToolType {
//     CREATE = "CREATE",
//     FETCH = "FETCH"
// }


// export const createTools = (type: ToolType, toolName: string, description: string) => {
//     if (type === ToolType.CREATE) {
//         return tool(
//             async (params: any) => await createRequest(params),  // TODO types issue
//             {
//                 name: toolName,
//                 description: description,
//                 schema: z.object({
//                     recipientAddress: z.string().describe("The EVM address of the recipient to use in the request."),
//                     currency: z.string().describe("The currency of the recipient want to pay in created request. eg. USDT, USDC, ETH, etc..."),
//                     amount: z.string().describe("The total amount, want to pay to the payee."),
//                     reason: z.string().describe("Reason for creating request for the payment."),
//                 }),
//             }
//         );
//     } else {
//         return tool(
//             async (params: any) => await fetchRequests(params),  // TODO types issue
//             {
//                 name: toolName,
//                 description: description,
//                 schema: z.object({
//                     address: z.string().describe("The EVM address of the user to see the pending payment requests.")
//                 }),
//             }
//         );
//     }
// }

// const agentCreationDetails = {
//     agentName: "",
//     instructions: "",
//     developerId: "",
//     tools: [
//         {
//             toolName: "create-invoice",
//             description: "It's just form a json to create invoice to the recipient to pay the amount to the payee.",
//             type: "CREATE"
//         },
//         {
//             toolName: "fetch-invoice",
//             description: "It's just form a json to fetch all the invoices for the user's by EVM address",
//             type: "FETCH"
//         },
//     ]
// }

// interface Tool {
//     toolName: string;
//     description: string;
//     type: string;
// }

// const tools = agentCreationDetails.tools.map((tool) =>
//     createTools(tool.type as ToolType, tool.toolName, tool.description)
// );

interface agentCreation {
    agentName: string;
    instructions: string;
    developerId: string;
}

interface agentRegistry {
    agentName: string;
    instructions: string;
    graph: any;
}

export let AGENT_REGISTRY: agentRegistry[] | any[] = [

]

export const createAgents = async (agentCreationDetails: agentCreation) => {

    const tools = [createRequestTool, fetchRequestsTool]

    const toolNode = new ToolNode(tools);

    // Create a model and bind it to tools
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY
    }).bindTools(tools);

    // Initialize memory to persist states between runs
    const checkpointer = new MemorySaver();

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
        const systemMessage = new SystemMessage(`Your name is ${agentCreationDetails?.agentName}. ${agentCreationDetails?.instructions}`);
        const response = await model.invoke([systemMessage, ...state.messages]);
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
    const graph = workflow.compile({ checkpointer: checkpointer });

    AGENT_REGISTRY.push({ agentName: agentCreationDetails.agentName, graph: graph, instructions: agentCreationDetails.instructions });

    return graph;
}

export const loadAgents = async () => {
    const agents = await fetchAgents();

    // agents?.map(async (agent) => {
    //     await createAgents({ agentName: agent.agentName, developerId: agent.developerId, instructions: agent.instructions })
    // });
    console.log("Agents loadded")
}


