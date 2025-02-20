"use client";

import InlineSVG from "react-inlinesvg";
import "./Playground.css";
import { useState } from "react";
import LeftAgent from "./LeftAgents";
import { Agent } from "@/config/types/types";
import ChatBox from "./ChatBox";

const agent = {
    agentName: "Decentramind",
    instructions: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis illo tenetur impedit sed cupiditate doloribus amet laboriosam numquam saepe!"
}

const agents: Agent[] = [
    {
        agentName: "Decentramind",
        instructions: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis illo tenetur impedit sed cupiditate doloribus amet laboriosam numquam saepe!"
    },
    {
        agentName: "CyberSentinel",
        instructions: "A vigilant AI-powered agent ensuring cybersecurity and privacy protection for all users."
    },
    {
        agentName: "QuantumGuide",
        instructions: "An advanced AI assistant providing insights into quantum computing and futuristic technologies."
    },
    {
        agentName: "QuantumGuide2",
        instructions: "An advanced AI assistant providing insights into quantum computing and futuristic technologies."
    }
];

const Playground: React.FC = () => {
    const [selectModal, setSelectModal] = useState(false);

    return (
        <div className="playground relative w-full bg-[#111521] min-h-[100vh] h-full pt-[6.5rem] 2xl:px-[6rem] xl:px-[5rem] md:px-[4.2rem] px-4 grid md:grid-cols-12 md:gap-6">
            <div className="left-agents md:block hidden md:col-span-4 col-span-12 py-[2rem] 2xl:pr-[1.5rem]">
                <LeftAgent agents={agents} />
            </div>
            <h2 className="md:hidden col-span-12 w-full text-white text-lg mt-1 fw-700">Select Agent</h2>
            <div className="pg-top-agent-box md:hidden col-span-12 w-full min-w-screen flex items-center justify-between h-[4rem] px-2 pr-5 rounded-lg border border-[#949494]" onClick={() => setSelectModal(true)}>
                <div className="title flex items-center gap-2">
                    <img src="/icons/agent-logo.svg" alt="agent" className="w-[2rem] h-[2rem] object-cover" />
                    <h2 className="text-white text-lg fw-600">Decentramind</h2>
                </div>
                <InlineSVG
                    src="/icons/down-arrow.svg"
                    className="fill-current bg-transparent w-4 h-4"
                />
            </div>
            <div className="right-chat md:col-span-8 col-span-12 md:pt-[2rem] md:pb-[2rem] pt-4 pb-[1rem] md:h-auto h-[calc(100vh-12.5rem)]">
                <ChatBox agent={agent} />
            </div>
            {selectModal && <div className="absolute md:hidden select-agents z-50 h-[100vh] w-full bg-re ">
                <div className="select-agnts relative h-full">
                    <div className="close-div w-full flex justify-center items-center pt-[5rem]">
                        <div className="close rounded-full p-2" onClick={() => setSelectModal(false)}>
                            <InlineSVG
                                src="/icons/close.svg"
                                className="fill-current w-5 h-5"
                            />
                        </div>
                    </div>
                    <div className="slct-agnts absolute bottom-0">
                        <LeftAgent agents={agents} />
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default Playground;
