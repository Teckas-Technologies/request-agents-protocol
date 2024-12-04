"use client";

import React, { useEffect, useRef, useState } from "react";
import InlineSVG from "react-inlinesvg";
import "./PlayGround.css"
import { Agent } from "../SPABody/SPABody";
import axios from "axios";
import { useAccount } from "wagmi";
import { useCreateRequest } from "@/hooks/useCreateRequests";

interface Props {
    agent: Agent | null;
}

interface Message {
    sender: "user" | "assistant";
    message: string;
}

const ChatBox: React.FC<Props> = ({ agent }) => {
    // const messages: Message[] = [
    //     { sender: "assistant", message: "Hello, how can I assist you?" },
    //     { sender: "user", message: "Hi! I need help with my invoice." },
    //     { sender: "assistant", message: "Sure! What do you need assistance with?" },
    //     { sender: "user", message: "I need to add an item to my invoice." },
    //     { sender: "assistant", message: "No problem. What item would you like to add?" },
    //     { sender: "user", message: "I want to add a laptop with a price of $1200." },
    //     { sender: "assistant", message: "Got it. Would you like to add any description for the item?" },
    //     { sender: "user", message: "Yes, please add 'High-performance gaming laptop' as the description." },
    //     { sender: "assistant", message: "The item has been added. Anything else you'd like to modify?" },
    //     { sender: "user", message: "Yes, can you apply a 10% discount to the item?" },
    //     { sender: "assistant", message: "Sure! The discount has been applied. The new price is $1080." },
    //     { sender: "user", message: "Great! Can you also add a warranty option?" },
    //     { sender: "assistant", message: "Done! I've added a 2-year warranty for $100. Anything else?" },
    //     { sender: "user", message: "No, that's all for now. Thanks for your help!" },
    //     { sender: "assistant", message: "You're welcome! Let me know if you need anything else." }
    // ];

    const [agentId, setAgentId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { sender: "assistant", message: "Hello, how can I assist you?" },
    ]);
    const [inputValue, setInputValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const { address, isConnected } = useAccount();
    const { createRequest } = useCreateRequest();

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom(); // Automatically scroll to the bottom when messages change
    }, [messages]);

    useEffect(() => {
        if (agent?.codeSnippet) {
            // Extract data-id using a regular expression
            const match = agent.codeSnippet.match(/data-id="([^"]+)"/);
            if (match) {
                setAgentId(match[1]); // Store the extracted value
            } else {
                setAgentId(null); // Reset if no data-id is found
            }
        } else {
            setAgentId(null); // Reset if no agent or codeSnippet
        }
    }, [agent]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;
        if (isLoading) return;

        const userMessage: Message = { sender: "user", message: inputValue };
        setMessages((prev) => [...prev, userMessage]); // Add user's message to messages
        setInputValue(""); // Clear the input field
        setIsLoading(true); // Indicate API is processing

        try {
            const requestBody = {
                id: "68",
                prompt: JSON.stringify({ query: inputValue, isWalletConnected: isConnected && address ? "true" : "false" }),
                agentId,
            };

            // Mock API call, replace with actual API logic
            const response = await axios.post("https://rnp-master-agent-d2b5etd8cwgzcaer.canadacentral-01.azurewebsites.net/voice-backend",
                requestBody,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            // const data = await response?.json();
            const assistantMessage: Message = {
                sender: "assistant",
                message: response.data.data.text, // Assuming API returns { reply: string }
            };

            if(response.data.intent === "finalJson") {
                // createRequest({})
                alert("Done")
            }

            setMessages((prev) => [...prev, assistantMessage]); // Add assistant's response
        } catch (error) {
            console.error("Error fetching chat response:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "assistant", message: "Sorry, something went wrong." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="chat-box w-full h-full bg-white h-auto md:px-[1.2rem] py-5 px-3 bg-white rounded-lg">
            <div className="chat w-full h-full flex flex-col gap-0" style={{ height: "calc(100vh - 11rem)" }}>
                <div className="top-chat w-full flex justify-between items-center h-[3rem] py-2">
                    <div className="agent-info flex items-center gap-2">
                        <div className="rn-logo w-[2rem] h-[2rem] p-2 bg-gray-200 rounded-full">
                            <img src="images/logo-sm.svg" alt="logo" className="w-full h-full object-cover" />
                        </div>
                        <h2>{agent?.agentName}</h2>
                    </div>
                    <div className="share border border-zinc-900 rounded-md p-1 cursor-pointer">
                        <InlineSVG
                            src="images/3-dots.svg"
                            className="fill-current w-5 h-5 text-zinc-900"
                        />
                    </div>
                </div>
                <div className="messages w-full pt-2 flex-grow overflow-y-scroll overflow-x-hidden">
                    {messages.map((msg, index) => (
                        <div key={index} className={`whole-div w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"} px-3`}>
                            <div className={`relative message ${msg.sender} p-2 mb-2 rounded-lg max-w-xs ${msg.sender === "user" ? "bg-zinc-300" : "bg-[#1fbf96]"}`}>
                                <p className={`text-sm ${msg.sender === "assistant" ? "text-white" : "text-black"}`}>{msg.message}</p>
                                {msg.sender === "assistant" ? <div className="absolute top-[-4px] left-[-7px]">
                                    <InlineSVG
                                        src="images/send.svg"
                                        style={{ transform: 'rotate(245deg)' }}
                                        className="fill-current w-5 h-5 text-[#1fbf96]"
                                    />
                                </div> : <div className="absolute top-[-4px] right-[-7px]">
                                    <InlineSVG
                                        src="images/send.svg"
                                        style={{ transform: 'rotate(23deg)' }}
                                        className="fill-current w-5 h-5 text-zinc-300"
                                    />
                                </div>}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="enter-div w-full flex items-center gap-2 h-[3rem]">
                    <div className="enter-box w-full flex flex-grow items-center gap-2 border border-grey-900 px-3 py-2 rounded-lg">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter your message here..."
                            className="flex-grow h-8 text-md font-medium border-none outline-none"
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <div className={`send-btn ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} onClick={handleSend}>
                            <InlineSVG
                                src="images/send.svg"
                                className="fill-current w-6 h-6 text-[#0BB489]"
                            />
                        </div>
                    </div>
                    <div className="voice-btn border border-grey-900 px-2 py-2 rounded-lg">
                        <div className="send-btn border border-[#0BB489] p-1.5 rounded-full cursor-not-allowed">
                            <InlineSVG
                                src="images/mic.svg"
                                className="fill-current w-5 h-5 text-[#0BB489]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatBox;