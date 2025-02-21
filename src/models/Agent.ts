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
        minlength: [5, 'Agent name must be at least 5 characters long'],
    },
    instructions: {
        type: String,
        required: true,
        minlength: [250, 'Instructions must be at least 250 characters long'],
    },
    codeSnippet: {
        type: String,
        default: '',
    }
}, { timestamps: true });

const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', agentSchema);

export { Agent };
