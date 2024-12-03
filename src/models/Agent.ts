import mongoose, { Schema, Document } from 'mongoose';

interface IAgent extends Document {
  developerId: string;
  agentName: string;
  prompt: string;
  codeSnippet: string;
}

const agentSchema = new Schema<IAgent>({
  developerId: { type: String, required: true },
  agentName: { type: String, required: true },
  prompt: { type: String, required: true },
  codeSnippet: { type: String, default: '' },
});

const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', agentSchema);

export { Agent };
