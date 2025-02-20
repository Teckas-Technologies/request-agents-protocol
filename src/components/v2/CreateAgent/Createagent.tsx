"use client";
import InlineSVG from "react-inlinesvg";
import "./CreateAgent.css"
import { useEffect, useState } from "react";

interface Props {
}

const CreateAgent: React.FC<Props> = ({ }) => {

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            setTimeout(() => {
                setCopied(false);
            }, 3000)
        }
    }, [copied])

    const copyToClipboard = () => {
        const codeElement = document.querySelector(".code-content");
        if (codeElement) {
            navigator.clipboard.writeText(codeElement.textContent || "").then(() => {
                // alert("Copied to clipboard!");
                setCopied(true);
            }).catch(err => {
                console.error("Failed to copy text: ", err);
            });
        }
    };

    return (
        <div className="create-agent-comp w-full bg-[#111521] flex md:flex-row flex-col pt-[6.5rem] min-h-[100vh] h-full md:px-[4.2rem] px-3">
            <div className="create-left md:w-[50%] w-full md:pr-[2rem] pr-1 py-[2rem]">
                <h1 className="text-xl text-white fw-600 mb-4">Steps to create an agent:</h1>
                <h2 className="text-lg text-white fw-500 mb-2">1. Provide the following details:</h2>
                <ul className="list-none pl-6 mb-2">
                    <li className="text-white">
                        <strong className="text-[#ABBDFE]">Agent Name:</strong> A descriptive name for your agent (e.g., "Invoice Agent").
                    </li>
                    <li className="text-white">
                        <strong className="text-[#ABBDFE]">Agent Prompt:</strong> Instructions for your agent. For example:
                        <div className="relative text-box p-4 mt-2 rounded-md border border-gray-300">
                            <code className="code-content block font-mono whitespace-pre-wrap text-white">
                                You are an assistant to help users to create an invoice and fetch their invoices. If the user wants to create an invoice, use the create-payment-request tool. If the user wants to fetch their invoices, use the fetch-payment-request tool.
                            </code>
                            <div onClick={copyToClipboard} className="copy absolute h-7 w-7 top-2 right-2 border border-zinc-800 flex items-center justify-center rounded-md cursor-pointer">
                                <InlineSVG
                                    src={copied ? "images/clipboard.svg" : "images/copy.svg"}
                                    className="fill-current w-4 h-4 text-grey-100"
                                />
                            </div>
                        </div>
                    </li>
                </ul>
                <p className="text-base text-white">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click <strong>"Submit"</strong> to create your agent.
                </p>
                <h2 className="text-lg text-white text-black fw-500 mt-3 mb-1">2. Integrate the agent into your project:</h2>
                <p className="text-base fw-400 text-white mb-2 ml-6">
                    After submitting the form, you'll receive a script to integrate the agent into your platform. Here's an example:
                </p>
                <div className="relative ml-6 text-box p-4 rounded-md border border-gray-300 mb-2">
                    <code className="code-content text-white block font-mono whitespace-pre-wrap">
                        &lt;Script id="chatbot"
                        src="https://script-sepia.vercel.app/ChatBot.js"
                        data-agent-id="&lt;!-- Your Agent Id --&gt;"&gt;&lt;/Script&gt;
                    </code>
                </div>

                <p className="text-base fw-400 text-white ml-6">
                    Replace the <code>data-agent-id</code> with your agent id.
                </p>
            </div>
            <div className="create-right md:w-[50%] w-full flex flex-col gap-5 md:pl-[2rem] md:pr-[3.5rem] pl-1 pr-1 py-[2rem]">
                <div className="agent-name flex flex-col gap-2 w-full">
                    <h2 className="text-white fw-500 text-lg">Agent Name</h2>
                    <input type="text" placeholder="eg. Invoicing Agent" className="text-[#D9D9D9] w-full px-[1.5rem] py-[0.8rem] bg-transparent border border-[#D9D9D9] rounded-lg" />
                </div>
                <div className="agent-instructions flex flex-col gap-2 w-full">
                    <h2 className="text-white fw-500 text-lg">Agent Instructions</h2>
                    <textarea placeholder="eg. Give some instructions for your agent..." className="text-[#D9D9D9] w-full px-[1.5rem] py-[0.8rem] bg-transparent border border-[#D9D9D9] rounded-lg h-[12rem] resize-none overflow-auto" />
                </div>
                <div className="create-btns flex items-center gap-3 pt-[1rem]">
                    <div className="discard-btn flex gap-2 items-center justify-center w-[50%] px-6 py-3 rounded-lg cursor-pointer">
                        <h2 className="font-medium discard-text fw-500 text-lg">Discard</h2>
                    </div>
                    <div className="connect-btn flex gap-2 items-center justify-center w-[50%] md:px-6 px-1 py-3 rounded-lg cursor-pointer">
                        <h2 className="font-medium text-white fw-500 text-lg">Create Agent</h2>
                        <img src="/images/right-arrow.png" alt="arrow" className="w-4 h-3.5 object-cover" />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default CreateAgent;