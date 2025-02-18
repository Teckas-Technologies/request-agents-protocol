import { NextApiRequest, NextApiResponse } from 'next';
import { createAgent, deleteAgent, fetchAgents, updateAgent } from '@/db_utils/agentUtils';
import { createAgents, loadAgents } from '@/graph/agentGraph';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const agents = await loadAgents();
            return res.status(200).json({agents, message: "agents loaded"});
        }
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    } catch (err) {
        console.error('API Error:', err);

        return res.status(400).json({
            error: err instanceof Error ? err.message : 'An unexpected error occurred',
        });
    }
}
