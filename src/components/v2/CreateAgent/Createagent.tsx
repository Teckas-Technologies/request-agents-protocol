"use client";
import InlineSVG from "react-inlinesvg";
import "./CreateAgent.css"
import { useEffect, useState } from "react";
import { useAgents } from "@/hooks/useAgents";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useAccount } from "wagmi";

interface Props {
    setMessage: (e: string) => void;
}

const CreateAgent: React.FC<Props> = ({ setMessage }) => {
    const { address } = useAccount();
    const { createAgent } = useAgents();
    const { user } = useUser();
    const [copied, setCopied] = useState(false);
    const [agentName, setAgentName] = useState("");
    const [instructions, setInstructions] = useState("");
    const [loading, setLoading] = useState(false);

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

    const submitCreation = async () => {
        if (!agentName && !instructions) {
            return;
        }
        if (!user || !user.sub) {
            setMessage("Make sure to login firse...");
            return;
        }
        if (!address) {
            setMessage("Please connect your EVM wallet!");
            return;
        }
        if (!agentName) {
            setMessage("Agent name is missing!");
            return;
        }
        if (agentName.length < 5) {
            setMessage("Agent name must be at least 5 characters long!");
            return;
        }
        if (!instructions) {
            setMessage("Agent instructions are missing!");
            return;
        }
        if (instructions.length < 250) {
            setMessage("Instructions must be at least 250 characters long!");
            return;
        }

        setLoading(true);
        const res = await createAgent({ agentName, instructions, developerId: user?.sub });
        console.log("RES: ", res)
        if (res.success) {
            setMessage(`Your Agent ${res.data.agentName} has been created successfully!`);
            setAgentName("");
            setInstructions("");
            setLoading(false);
        } else {
            setLoading(false);
            setMessage(res?.error || "Something went wrong!");
        }
        setLoading(false);
    }

    const discard = () => {
        setAgentName("");
        setInstructions("");
    }

    return (
        <div className="create-agent-comp w-full bg-[#111521] flex md:flex-row flex-col pt-[6.5rem] min-h-[100vh] h-full 2xl:px-[6rem] xl:px-[5rem] md:px-[4.2rem] px-3">
            <div className="create-left md:w-[50%] w-full md:pr-[2rem] pr-1 py-[2rem]">
                <h1 className="text-xl text-white fw-600 mb-4">Steps to create an agent:</h1>
                <h2 className="text-lg text-white fw-500 mb-2">1. Provide the following details:</h2>
                <ul className="list-none pl-6 mb-2">
                    <li className="text-white">
                        <strong className="text-[#ABBDFE]">Agent Name:</strong> A descriptive name for your agent (e.g., "Invoice Agent").
                    </li>
                    <li className="text-white">
                        <strong className="text-[#ABBDFE]">Agent Instructions:</strong> Instructions for your agent. For example:
                        <div className="relative text-box p-4 mt-2 rounded-md border border-gray-300">
                            <code className="code-content block font-mono whitespace-pre-wrap text-white">
                                You are an assistant for helping users to interact with Request Network Protocol for Invoicing activities. Use the 'create-request' tool to create an invoice. Use 'fetch-requests' tool to fetch the invoices for the user. Use 'pay-request' tool to pay the invoice.
                            </code>
                            <div onClick={copyToClipboard} className="copy absolute h-7 w-7 top-2 right-2 border border-white flex items-center justify-center rounded-md cursor-pointer">
                                <InlineSVG
                                    src={copied ? "images/clipboard.svg" : "images/copy.svg"}
                                    className="fill-current w-4 h-4 text-grey-100"
                                />
                            </div>
                        </div>
                    </li>
                </ul>
                <p className="text-base text-white">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click <strong>"Create Agent"</strong> to create your agent.
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
            <div className="create-right md:w-[50%] w-full flex flex-col gap-5 md:pl-[2rem] lg:pr-[3.5rem] pl-1 pr-1 py-[2rem]">
                <div className="agent-name flex flex-col gap-2 w-full">
                    <h2 className="text-white fw-500 text-lg">Agent Name</h2>
                    <input type="text" placeholder="eg. Invoicing Agent" value={agentName} onChange={(e) => setAgentName(e.target.value)} className="text-[#D9D9D9] w-full px-[1.5rem] py-[0.8rem] bg-transparent border border-[#D9D9D9] rounded-lg" />
                </div>
                <div className="agent-instructions flex flex-col gap-2 w-full">
                    <h2 className="text-white fw-500 text-lg">Agent Instructions</h2>
                    <textarea placeholder="eg. Give some instructions for your agent..." value={instructions} onChange={(e) => setInstructions(e.target.value)} className="text-[#D9D9D9] scroll-d w-full px-[1.5rem] py-[0.8rem] bg-transparent border border-[#D9D9D9] rounded-lg h-[12rem] resize-none overflow-auto" />
                </div>
                <div className="create-btns flex items-center gap-3 pt-[1rem]">
                    <div className="discard-btn flex gap-2 items-center justify-center w-[50%] px-6 py-3 rounded-lg cursor-pointer" onClick={discard}>
                        <h2 className="font-medium discard-text fw-500 text-lg">Discard</h2>
                    </div>
                    <div className="connect-btn flex gap-2 items-center justify-center w-[50%] md:px-6 px-1 py-3 rounded-lg cursor-pointer" onClick={submitCreation}>
                        <h2 className="font-medium text-white fw-500 text-lg">Create Agent</h2>
                        {!loading && <img src="/images/right-arrow.png" alt="arrow" className="w-4 h-3.5 object-cover" />}
                        {loading && <div className="loading flex items-center">
                            <div role="status">
                                <svg aria-hidden="true" className="inline w-4 h-4 text-zinc-200 animate-spin dark:text-zinc-300 fill-zinc-900 dark:fill-zinc-900" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )

}

export default CreateAgent;