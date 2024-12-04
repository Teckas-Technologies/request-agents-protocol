"use client";

import { useSearchParams } from "next/navigation";
import { Agent } from "../SPABody/SPABody";
import { useEffect } from "react";

interface Props {
    agents: Agent[];
    onAgentClick: (agent: Agent) => void; // New prop to handle clicks
}

const ScrollAgents: React.FC<Props> = ({ agents, onAgentClick }) => {

    const searchParams = useSearchParams();
    const agentId = searchParams?.get("agentId");

    useEffect(() => {
        if (agentId) {
            // Find the agent with the matching data-id
            const matchedAgent = agents.find((agent) => {
                const match = agent.codeSnippet.match(/data-id="([^"]+)"/);
                return match && match[1] === agentId;
            });
            if (matchedAgent) {
                onAgentClick(matchedAgent);
            }
        }
    }, [agentId, agents]);

    return (
        <div className="agent-list w-full bg-white h-auto md:px-[1.2rem] py-5 px-3 bg-white rounded-lg">
            <h1 className="text-xl font-bold mb-3 text-black">My Agents</h1>
            <div className="agents-scroll-list w-full flex flex-col gap-2 overflow-y-scroll border border-grey-800 rounded-lg p-2" style={{ height: "calc(100vh - 13.5rem)" }}>
                {agents.map((agent, index) => (
                    <div key={index} onClick={() => onAgentClick(agent)} className="agent border py-2 border-grey-800 rounded-lg cursor-pointer">
                        <div className="top px-2 pb-1 flex items-center gap-2">
                            <div className="rn-logo w-[2rem] h-[2rem] p-2 bg-gray-200 rounded-full">
                                <img src="images/logo-sm.svg" alt="logo" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-md truncate-1-lines">{agent.agentName}</h2>
                        </div>
                        <p className="px-3 text-sm text-zinc-500 truncate-2-lines">{agent.prompt}</p>
                    </div>
                ))}
            </div>
        </div>
    )

}

export default ScrollAgents;