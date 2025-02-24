"use client";

import { Agent } from "@/config/types/types";
import InlineSVG from "react-inlinesvg";

interface Props {
    listRef: any;
    agents: Agent[] | [];
    loading: boolean;
    selectedAgent: Agent | null;
    setSelectedAgent: (e: Agent) => void;
    setSearchText: (e: string) => void;
    searchText: string;
    handleSearchChange: (e: any) => void;
    setSelectModal?: (e: boolean) => void;
}

const LeftAgent: React.FC<Props> = ({ listRef, agents, loading, selectedAgent, setSelectedAgent, setSearchText, setSelectModal }) => {

    return (
        <div className="agents-box h-full bg-[#111521] border border-[#949494] rounded-xl py-[1rem] flex flex-col h-auto">
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
                        onChange={(e) => setSearchText(e.target.value)}
                        className="text-[#AFAFAF] text-sm w-full py-[0.8rem] bg-transparent rounded-lg border-none outline-none"
                    />
                </div>
            </div>
            <div
                ref={listRef}
                className="agents-list px-[1.5rem] pr-[1.3rem] scroll-d space-y-3 overflow-y-auto max-h-[calc(100vh-295px)] scrollbar-thin scrollbar-thumb-[#ABBDFE] scrollbar-track-[#AFAFAF] scrollbar-rounded"
            >
                {agents && agents.length > 0 && agents.map((agent, index) => (
                    <div key={index} className={`pg-agent-card w-full min-h-[8rem] max-h-[8rem] rounded-lg p-[1rem] cursor-pointer border ${selectedAgent?.agentName === agent.agentName ? "border-[#ABBDFE]" : "border-[#909090]"}`} onClick={() => { setSelectedAgent(agent); if (setSelectModal) { setSelectModal(false); } }}>
                        <div className="title flex items-center gap-2">
                            <img src="/icons/agent-logo.svg" alt="agent" className="w-[2rem] h-[2rem] object-cover" />
                            <h2 className="text-white text-lg fw-600">{agent.agentName}</h2>
                        </div>
                        <p className="text-[#D9D9D9] text-sm mt-1 truncate-3-lines">{agent.instructions}</p>
                    </div>
                ))}
                {loading && <p className="text-white text-center py-2">Loading {agents.length > 0 && "more"} agents...</p>}
                {!loading && agents.length === 0 && <p className="text-white text-center py-2">No agents found!</p>}
            </div>
        </div>
    );
};

export default LeftAgent;