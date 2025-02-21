"use client"

import { Agent } from "@/config/types/types";
import InlineSVG from "react-inlinesvg";

interface Props {
    agents: Agent[]
}

const LeftAgent: React.FC<Props> = ({ agents }) => {
    return (
        <div className="agents-box h-full border border-[#949494] rounded-xl py-[1rem] flex flex-col">
            <h2 className="text-white text-lg fw-600 px-[1.5rem]">Agents</h2>
            <div className="search px-[1.5rem]">
                <div className="search-out flex items-center px-[1rem] gap-2 mt-1 mb-3 border border-[#909090] rounded-lg">
                    <InlineSVG
                        src="/icons/search.svg"
                        className="fill-current w-5 h-5 text-zinc-900"
                    />
                    <input
                        type="text"
                        placeholder="Search for agents"
                        className="text-[#AFAFAF] text-sm w-full py-[0.8rem] bg-transparent rounded-lg"
                    />
                </div>
            </div>
            <div className="agents-list px-[1.5rem] pr-[1.3rem] scroll-d space-y-3 overflow-y-auto max-h-[calc(100vh-305px)] scrollbar-thin scrollbar-thumb-[#ABBDFE] scrollbar-track-[#AFAFAF] scrollbar-rounded">
                {agents.map((agent, index) => (
                    <div key={index} className="pg-agent-card w-full min-h-[8rem] max-h-[8rem] rounded-lg p-[1rem] border border-[#909090]">
                        <div className="title flex items-center gap-2">
                            <img src="/icons/agent-logo.svg" alt="agent" className="w-[2rem] h-[2rem] object-cover" />
                            <h2 className="text-white text-lg fw-600">{agent.agentName}</h2>
                        </div>
                        <p className="text-[#D9D9D9] text-sm mt-1 truncate-3-lines">{agent.instructions}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LeftAgent;