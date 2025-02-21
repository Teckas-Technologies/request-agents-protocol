import { connectToDatabase } from '@/lib/mongodb';
import { Agent } from '@/models/Agent';

export async function fetchAgents(devId?: string, page: number = 1, search?: string) {
    await connectToDatabase();

    const limit = 5;
    const skip = (page - 1) * limit; // Calculate offset

    try {
        let query: any = {};

        if (devId) {
            query.developerId = devId;
        }

        if (search) {
            query.agentName = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        const agents = await Agent.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip);
        const totalCount = await Agent.countDocuments(query); // Get total count of agents

        return {
            agents,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        };
    } catch (err) {
        console.error('Error fetching agents:', err);
        throw new Error('Failed to fetch agents');
    }
}

export async function fetchAgentById(agentId: string) {
    await connectToDatabase();

    if (!agentId) {
        throw new Error('Agent ID is required');
    }

    try {
        const agent = await Agent.findById(agentId);
        if (!agent) {
            throw new Error('Agent not found');
        }
        return agent;
    } catch (err) {
        console.error('Error fetching agent by ID:', err);
        throw new Error(err instanceof Error ? err.message : 'Failed to fetch agent');
    }
}


export async function createAgent(developerId: string, agentName: string, instructions: string) {
    await connectToDatabase();
    if (!developerId || !agentName || !instructions) {
        throw new Error('Missing required fields');
    }
    try {

        const existingAgent = await Agent.findOne({ agentName, developerId });
        if (existingAgent) {
            throw new Error('Agent with the same name already exists');
        }

        const agent = new Agent({ developerId, agentName, instructions, codeSnippet: '' });
        const savedAgent = await agent.save();
        savedAgent.codeSnippet = `<script id="chatbot" src="https://script-sepia.vercel.app/ChatBot.js" data-agent-id="${savedAgent._id}"></script>`;
        await savedAgent.save();
        return savedAgent;
    } catch (err) {
        console.error('Error creating agent:', err);
        throw new Error(err instanceof Error ? err.message : 'Failed to create agent');
    }
}

export async function updateAgent(agentId: string, updateData: any) {
    await connectToDatabase();

    if (!agentId) {
        throw new Error('Agent ID is required');
    }

    try {
        // Check if the agent exists
        const existingAgent = await Agent.findById(agentId);
        if (!existingAgent) {
            throw new Error('Agent not found');
        }

        // If agentName is being updated, check if another agent with the same name exists
        if (updateData.agentName) {
            const duplicateAgent = await Agent.findOne({
                agentName: updateData.agentName,
                developerId: updateData.developerId,
                _id: { $ne: agentId } // Ensure it's not the same agent being updated
            });

            if (duplicateAgent) {
                throw new Error('Agent with the same name already exists');
            }
        }

        // Update agent
        const updatedAgent = await Agent.findByIdAndUpdate(agentId, updateData, { new: true });

        return updatedAgent;
    } catch (err) {
        console.error('Error updating agent:', err);

        throw new Error(err instanceof Error ? err.message : 'Failed to update agent');
    }
}


export async function deleteAgent(agentId: string) {
    await connectToDatabase();
    if (!agentId) {
        throw new Error('Agent ID is required');
    }
    try {
        const deletedAgent = await Agent.findByIdAndDelete(agentId);
        if (!deletedAgent) {
            throw new Error('Agent not found');
        }
        return { message: 'Agent deleted successfully' };
    } catch (err) {
        console.error('Error deleting agent:', err);
        throw new Error('Failed to delete agent');
    }
}