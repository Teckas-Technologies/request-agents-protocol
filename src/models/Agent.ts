import mongoose from 'mongoose';

interface IAgent extends Document {
    developerId: string;
    agentName: string;
    instructions: string;
    codeSnippet: string;
}

const agentSchema = new mongoose.Schema<IAgent>({
    developerId: {
        type: String,
        required: true,
    },
    agentName: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true,
    },
    codeSnippet: {
        type: String,
        default: '',
    }
}, { timestamps: true });

const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', agentSchema);

export { Agent };
