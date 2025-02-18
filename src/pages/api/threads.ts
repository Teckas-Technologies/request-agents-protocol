import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MONGODB_URI } from '@/config/constants';
import { connectToDatabase } from '@/lib/mongodb';

const client = new MongoClient(MONGODB_URI);
const checkpointer = new MongoDBSaver({ client });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId, agentId } = req.query;
    const readConfig = {
        configurable: {
            thread_id: userId + "-" + agentId
        }
    };
    try {
        if (req.method === 'GET') {
            const messages = await checkpointer.get(readConfig);
            return res.status(200).json(messages);
        }
        if (req.method === 'PUT') {
            
        }
        if (req.method === 'DELETE') {
            
        }
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    } catch (err) {
        console.error('API Error:', err);

        return res.status(400).json({
            error: err instanceof Error ? err.message : 'An unexpected error occurred',
        });
    }
}
