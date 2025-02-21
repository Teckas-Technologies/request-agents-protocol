"use client"

import { Agent } from "@/config/types/types";
import { useState } from "react";
import InlineSVG from "react-inlinesvg";

interface Props {
    agent: Agent
}

const ChatBox: React.FC<Props> = ({ agent }) => {
    const [switchToCode, setSwitchToCode] = useState(false);

    return ( 
        <div className="playgound-box relative h-full border border-[#949494] rounded-xl flex flex-col">
            <div className="playground-top w-full h-[4rem] flex items-center justify-between md:px-[1.5rem] px-4">
                <h2 className="text-white">Playground</h2>
                <div className="playground-top-right flex items-center gap-2">
                    <h4 className="text-white text-sm">Switch to</h4>
                    <div className="switch bg-[#ABBDFE] p-1 rounded-md cursor-pointer" onClick={() => setSwitchToCode(!switchToCode)}>
                        {switchToCode ? <InlineSVG
                            src="/icons/chat.svg"
                            className="fill-current bg-transparent w-5 h-5"
                        /> :
                            <InlineSVG
                                src="/icons/code.svg"
                                className="fill-current bg-transparent w-5 h-5"
                            />}
                    </div>
                </div>
            </div>
            {switchToCode && <div className="playground-center h-full md:p-[2rem] p-4">
                <h2 className="text-[#AFAFAF] text-sm mt-1"><strong className="text-[#ABBDFE] text-md">Title: </strong> {agent.agentName}</h2>
                <p className="text-[#AFAFAF] text-sm mt-1"><strong className="text-[#ABBDFE] text-md">Instructions: </strong> {agent.instructions}</p>
                <p className="text-[#AFAFAF] text-sm mt-1"><strong className="text-[#ABBDFE] text-md">Code Snippet: </strong> &lt;script id="chatbot" src="https://abi-script.vercel.app/ChatBot.js" data-agent-id="67aa15e2f694c6a5f524e204"&gt;&lt;/script&gt;</p>
            </div>}
            {!switchToCode && <>
                <div className="playground-center h-full flex justify-center items-center pb-[5rem]">
                    <p className="text-sm text-[#D9D9D9]">Execute Transactions with AI</p>
                </div>
                <div className="playground-bottom absolute bottom-0 left-0 w-full md:h-[5rem] h-[4rem] md:px-[1rem] md:pb-[1rem] px-[0.8rem] pb-[0.8rem] mr-5">
                    <div className="type-msg border border-[#949494] flex items-center justify-between p-[0.2rem] pl-[1rem] pr-[0.5rem] gap-2 rounded-lg">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            className="text-[#AFAFAF] text-md w-full py-[0.7rem] bg-transparent rounded-lg border-none outline-none"
                        />
                        <div className="send-box flex items-center justify-center w-[2rem] h-[2rem] rounded-md">
                            <InlineSVG
                                src="/icons/send.svg"
                                className="fill-current w-5 h-5"
                            />
                        </div>
                    </div>
                </div>
            </>}
        </div>
    )
}

export default ChatBox;