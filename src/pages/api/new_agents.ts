import { NextApiRequest, NextApiResponse } from 'next';
import { createAgent, deleteAgent, fetchAgents, updateAgent } from '@/db_utils/agentUtils';
// import { createAgents } from '@/graph/agentGraph';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const agents = await fetchAgents(req.query.devId as string);
            return res.status(200).json(agents);
        }
        if (req.method === 'POST') {
            const { developerId, agentName, instructions } = req.body;
            // const agentGraph = await createAgents(req.body);
            // console.log("Graph:", agentGraph)
            const agent = await createAgent(developerId, agentName, instructions);
            return res.status(201).json(agent);
        }
        if (req.method === 'PUT') {
            const { agentId } = req.query;
            const updatedAgent = await updateAgent(agentId as string, req.body);
            return res.status(200).json(updatedAgent);
        }
        if (req.method === 'DELETE') {
            const { agentId } = req.query;
            const response = await deleteAgent(agentId as string);
            return res.status(200).json(response);
        }
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    } catch (err) {
        console.error('API Error:', err);

        return res.status(400).json({
            error: err instanceof Error ? err.message : 'An unexpected error occurred',
        });
    }
}
