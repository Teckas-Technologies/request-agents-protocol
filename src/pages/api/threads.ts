import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MONGODB_URI } from '@/config/constants';

const client = new MongoClient(MONGODB_URI);
const checkpointer = new MongoDBSaver({ client });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId, agentId } = req.query;
    const threadId = userId + "-" + agentId;
    const readConfig = {
        configurable: {
            thread_id: threadId
        }
    };
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection("checkpoints");

        if (req.method === 'GET') {
            const data = await checkpointer.get(readConfig);

            // Extract messages from the response
            const messages = data?.channel_values?.messages || [];

            if (!Array.isArray(messages)) {
                return res.status(200).json({ messages: [] }); // Return empty array if messages are not found
            }

            // Map and return only role, content, and id
            const filteredMessages = messages.map((msg: any) => ({
                role: msg.constructor?.name.replace("Message", "").toLowerCase() || "unknown", // Convert "SystemMessage" -> "system", "HumanMessage" -> "human", etc.
                content: msg.lc_kwargs.content,
                id: msg.lc_kwargs.id
            }));

            return res.status(200).json({ messages: filteredMessages });
        }
        if (req.method === 'DELETE') {
            const result = await collection.deleteMany({ thread_id: threadId });
            return res.status(200).json({ message: `Deleted ${result.deletedCount} messages for thread_id: ${threadId}` });
        }
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    } catch (err) {
        console.error('API Error:', err);

        return res.status(400).json({
            error: err instanceof Error ? err.message : 'An unexpected error occurred',
        });
    }
}
