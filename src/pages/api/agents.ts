import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Agent } from '@/models/Agent';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { developerId, agentName, prompt } = req.body;
  const { devId } = req.query;

  if (req.method === 'GET') {
    // Fetch all agents for a developer
    try {
      console.log('dev Id:', devId);
      const agents = await Agent.find({ developerId: devId });
      return res.status(200).json(agents);
    } catch (err) {
      console.error('Error fetching agents:', err);
      return res.status(500).json({ error: 'Failed to fetch agents' });
    }
  }

  if (req.method === 'POST') {
    if (!developerId || !agentName || !prompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Create a new agent
      const agent = new Agent({
        developerId,
        agentName,
        prompt,
        codeSnippet: '',
      });

      const savedAgent = await agent.save();
      // <Script id="chatbot" src="https://script-sepia.vercel.app/ChatBot.js" data-agent-id="6751bbe4b078ade1be331d7b" data-account-id={address}  data-wallet-client={JSON.stringify(walletClient)}></Script>
      const codeSnippet = `<script id="chatbot" src="https://script-sepia.vercel.app/ChatBot.js" data-agent-id="${savedAgent._id}"></script>`
      // const codeSnippet = `<script src="https://cdn.request-protocol.com/bot.js" data-id="${savedAgent._id}"></script>`;
      savedAgent.codeSnippet = codeSnippet;
      await savedAgent.save();

      // Prepare data to send to external server
      const externalServerURL = 'https://rnp-master-agent-d2b5etd8cwgzcaer.canadacentral-01.azurewebsites.net/store-agent-spec';
      const requestData = {
        agentId: savedAgent._id.toString(),
        agentSpec: prompt,  // The 'prompt' field is used as agentSpec
      };

      console.log("savedAgent:", savedAgent)

      // return res.status(201).json({
      //   message: 'Agent created successfully and data sent to external server.',
      //   codeSnippet,
      //   agentId: savedAgent._id,
      // });

      try {
        const externalResponse = await axios.post(externalServerURL, requestData);
        console.log("externalResponse:", externalResponse)
        // Handle the external server response
        if (externalResponse.status === 200) {
          console.log('Data sent to external server successfully.');
          return res.status(201).json({
            message: 'Agent created successfully and data sent to external server.',
            codeSnippet,
            agentId: savedAgent._id,
          });
        } else {
          // If the response status is not 200, handle failure
          console.error('External server responded with error:', externalResponse.status);
          await savedAgent.deleteOne(); // Delete the agent
          return res.status(500).json({
            error: 'Failed to send data to external server, agent deleted.',
          });
        }
      } catch (externalError) {
        console.error('Error sending data to external server:', externalError);
        await savedAgent.deleteOne(); // Delete the agent in case of failure
        return res.status(500).json({
          error: 'Failed to send data to external server, agent deleted.',
        });
      }

    } catch (err) {
      console.error('Error creating agent:', err);
      return res.status(500).json({ error: 'Failed to create agent' });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
