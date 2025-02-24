"use client";

import InlineSVG from "react-inlinesvg";
import "./Playground.css";
import { useCallback, useEffect, useRef, useState } from "react";
import LeftAgent from "./LeftAgents";
import { Agent } from "@/config/types/types";
import ChatBox from "./ChatBox";
import { useAgents } from "@/hooks/useAgents";
import { useUser } from "@auth0/nextjs-auth0/client";

interface Props {
    setErrMessage: (e: string) => void;
}

const Playground: React.FC<Props> = ({ setErrMessage }) => {
    const [selectModal, setSelectModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");

    const { fetchAllAgents, totalPages } = useAgents();
    const { user } = useUser();

    const listRef = useRef<HTMLDivElement>(null); // Reference to agents-list div

    const fetchAgents = async (pageNumber: number, search = "") => {
        if (!user?.sub || loading || (totalPages && pageNumber > totalPages)) return;

        setLoading(true);
        try {
            const response = await fetchAllAgents(user.sub, pageNumber, search);
            setAgents((prevAgents) => {
                const updatedAgents = pageNumber === 1 ? response.agents : [...prevAgents, ...response.agents];

                // Set the first agent as selected initially
                if (!selectedAgent && updatedAgents.length > 0) {
                    setSelectedAgent(updatedAgents[0]);
                }

                return updatedAgents;
            });
            setPage(pageNumber + 1); // Update next page
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.sub) {
            fetchAgents(1, searchText); // Fetch initial page 1 with search filter
        }
    }, [user, searchText]);

    // Infinite Scroll Handler
    const handleScroll = useCallback(() => {
        if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 10 && !loading) {
                fetchAgents(page, searchText); // Fetch next page when user reaches bottom
            }
        }
    }, [page, loading, searchText]);

    useEffect(() => {
        const currentRef = listRef.current;
        if (currentRef) {
            currentRef.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (currentRef) {
                currentRef.removeEventListener("scroll", handleScroll);
            }
        };
    }, [handleScroll]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setPage(1); // Reset pagination when searching
        setAgents([]); // Clear previous agents to show new search results
    };

    return (
        <div className="playground relative w-full bg-[#111521] min-h-[100vh] h-full pt-[6.5rem] 2xl:px-[6rem] xl:px-[5rem] md:px-[4.2rem] px-4 grid md:grid-cols-12 md:gap-6">
            <div className="left-agents md:block hidden md:col-span-4 col-span-12 py-[2rem] 2xl:pr-[2rem]">
                <LeftAgent
                    listRef={listRef}
                    agents={agents}
                    loading={loading}
                    selectedAgent={selectedAgent}
                    setSelectedAgent={setSelectedAgent}
                    setSearchText={setSearchText}
                    searchText={searchText}
                    handleSearchChange={handleSearchChange}
                />
            </div>
            <div className="pg-top-agent-box md:hidden col-span-12 w-full min-w-screen flex items-center mt-4 justify-between h-[4rem] px-2 pr-5 rounded-lg border border-[#949494]" onClick={() => setSelectModal(true)}>
                <div className="title flex items-center gap-2">
                    <img src="/icons/agent-logo.svg" alt="agent" className="w-[2rem] h-[2rem] object-cover" />
                    <h2 className="text-white text-lg fw-600">{selectedAgent?.agentName || "Select an agent"}</h2>
                </div>
                <InlineSVG
                    src="/icons/down-arrow.svg"
                    className="fill-current bg-transparent w-4 h-4"
                />
            </div>
            <div className="right-chat md:col-span-8 col-span-12 md:pt-[2rem] md:pb-[2rem] pt-4 pb-[1rem] md:h-auto h-[calc(100vh-12.5rem)]">
                <ChatBox agent={selectedAgent} setErrMessage={setErrMessage} />
            </div>
            {selectModal && (
                <div className="absolute md:hidden select-agents z-50 h-[100vh] w-full bg-re">
                    <div className="select-agnts relative h-full">
                        <div className="close-div w-full flex justify-center items-center pt-[5rem]">
                            <div className="close rounded-full p-2" onClick={() => setSelectModal(false)}>
                                <InlineSVG src="/icons/close.svg" className="fill-current w-5 h-5" />
                            </div>
                        </div>
                        <div className="slct-agnts absolute bottom-0 min-w-screen bg-[#111521] w-[100%] min-h-[80vh]">
                            <LeftAgent
                                listRef={listRef}
                                agents={agents}
                                loading={loading}
                                selectedAgent={selectedAgent}
                                setSelectedAgent={setSelectedAgent}
                                setSearchText={setSearchText}
                                searchText={searchText}
                                handleSearchChange={handleSearchChange}
                                setSelectModal={setSelectModal}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playground;