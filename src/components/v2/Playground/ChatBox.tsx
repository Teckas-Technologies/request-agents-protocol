"use client"

import { currencies } from "@/config/currencies";
import { Agent } from "@/config/types/types";
import { useChat } from "@/hooks/useChat";
import { useCreateRequest } from "@/hooks/useCreateRequests";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useRef, useState } from "react";
import InlineSVG from "react-inlinesvg";
import { useAccount } from "wagmi";

interface Props {
    agent: Agent | null;
}

interface Message {
    role: "ai" | "human";
    content: string;
}

// New chatbox
const ChatBox: React.FC<Props> = ({ agent }) => {
    const [switchToCode, setSwitchToCode] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isCreating, setIsCreating] = useState(false)
    const { chat } = useChat();
    const { user } = useUser();
    const { address, isConnected } = useAccount();
    const { createRequest } = useCreateRequest();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!user || !user.sub || !agent || !inputValue.trim()) return;

        const newMessage: Message = { role: "human", content: inputValue };
        setMessages((prev) => [...prev, newMessage]);
        setInputValue(""); // Clear input field

        try {
            const response = await chat({ agentId: agent._id, userId: user.sub, query: inputValue });
            if (response?.data) {
                if (response.data?.lastToolMessage !== null) {
                    const toolMessage = JSON.parse(response?.data?.lastToolMessage?.replace(/^"|"$/g, ""));
                    console.log("TOOL MSG: ", toolMessage)
                    if (toolMessage?.success) {
                        if (toolMessage?.type === "fetch") {  // Maybe change flow
                            if (response.data?.lastAiMessage) {
                                const aiMessage: Message = { role: "ai", content: response.data?.lastAiMessage };
                                setMessages((prev) => [...prev, aiMessage]);
                                return;
                            }
                        }
                        if (toolMessage?.type === "create") {
                            const { payerAddress, amount, currency, reason } = toolMessage?.data;
                            if (!payerAddress || !amount || !currency || !reason) {
                                console.log("Missing details in reply tool msg")
                                return;
                            }

                            const currencyKey = Array.from(currencies.entries()).find(
                                ([key, curr]) => curr.symbol.toLowerCase().includes(currency.toLowerCase()) && curr.chainId === 11155111
                            )?.[0]; // Extract the key from the entry

                            console.log("currencyKey", currencyKey)

                            if (!currencyKey) {
                                setMessages((prev) => [...prev, { role: "ai", content: "Unsupported currency!" }]);
                                return;
                            }
                            console.log(payerAddress, address)
                            if (!payerAddress || (payerAddress.trim().startsWith("0x") && payerAddress.trim().length !== 42)) {
                                setMessages((prev) => [...prev, { role: "ai", content: "Not a valid payer address!" }]);
                                return;
                            }
                            if (!address || (address.trim().startsWith("0x") && address.trim().length !== 42)) {
                                setMessages((prev) => [...prev, { role: "ai", content: "Not a valid payee address, Connect another EVM address!" }]);
                                return;
                            }

                            const today = new Date();
                            const dueDate = new Date();
                            dueDate.setDate(today.getDate() + 10); // Add 10 days

                            const formattedDueDate = new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }).format(dueDate);

                            const formattedToday = new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }).format(today);

                            setMessages((prev) => [...prev, { role: "ai", content: "Creating your request!" }]);
                            setIsCreating(true);

                            console.log("amount", amount.trim(),);

                            const createdResponse = await createRequest({
                                recipientAddress: address.trim() || "",
                                currency: currencyKey.trim(),
                                payerAddress: payerAddress.trim(),
                                amount: amount.trim(),
                                storageChain: "11155111",
                                currentDate: formattedToday,
                                dueDate: formattedDueDate,
                                reason: reason,
                                extra: {}
                            })

                            console.log("RES CREATION:", createdResponse)

                            if (createdResponse?.success) {
                                setMessages((prev) => [...prev, {
                                    role: "ai", content: `
                                    ${response.data?.lastAiMessage}
                                    <div hidden>Request Created</div>
                                    <span hidden>${createdResponse.data.confirmedRequestData?.requestId.trim()}</span>
                                    ` }]);
                                setIsCreating(false);
                                return;
                            } else {
                                setMessages((prev) => [...prev, { role: "ai", content: "You request creation has been failed, Please try again later!" }]);
                                setIsCreating(false);
                                return;
                            }
                        }
                        if (toolMessage?.type === "pay") {

                        }
                    }
                }
                const aiMessage: Message = { role: "ai", content: response.data?.lastAiMessage };
                setMessages((prev) => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error("Chat error:", error);
        }
    };

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
                <h2 className="text-[#AFAFAF] text-sm mt-1"><strong className="text-[#ABBDFE] text-md">Title: </strong> {agent?.agentName}</h2>
                <p className="text-[#AFAFAF] text-sm mt-1"><strong className="text-[#ABBDFE] text-md">Instructions: </strong> {agent?.instructions}</p>
                <p className="text-[#AFAFAF] text-sm mt-1"><strong className="text-[#ABBDFE] text-md">Code Snippet: </strong> {agent?.codeSnippet}</p>
            </div>}
            {!switchToCode && <>
                {messages.length === 0 && <div className="playground-center h-full flex justify-center items-center p-[1rem] mb-[4rem]">
                    <p className="text-sm text-[#D9D9D9]">Execute Transactions with AI</p>
                </div>}
                {messages.length > 0 && <div className="playground-center h-full w-full p-[1rem] mb-[4rem] scroll-d overflow-y-auto max-h-[calc(100vh-305px)]">
                    {messages.map((message) => {
                        return (
                            <div className={`message-div w-full h-auto mt-2 flex ${message.role === "ai" ? "justify-start" : "justify-end"}`}>
                                <p className={`text-white px-3 py-2 rounded-lg ${message.role === "human" ? "bg-[#B2A1FC] max-w-md" : "bg-[#414141] max-w-lg"}`}>{message.content}</p>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>}
                <div className="playground-bottom absolute bottom-0 left-0 w-full md:h-[4rem] rounded-xl h-[3.2rem] flex items-center justify-center bg-[#111521] md:px-[1rem] md:pb-[1rem] px-[0.8rem] pb-[0.8rem] mr-5">
                    <div className="type-msg w-full border border-[#949494] flex items-center justify-between p-[0.2rem] pl-[1rem] pr-[0.5rem] gap-2 rounded-lg">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            className="text-[#AFAFAF] text-md w-full py-[0.5rem] bg-transparent rounded-lg border-none outline-none"
                        />
                        <div className="send-box flex items-center justify-center w-[2rem] h-[2rem] rounded-md" onClick={handleSend}>
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