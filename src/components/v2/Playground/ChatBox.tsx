"use client"

import { currencies } from "@/config/currencies";
import { Agent, Message } from "@/config/types/types";
import { useApprove } from "@/hooks/useApprove";
import { useChat } from "@/hooks/useChat";
import { useCreateRequest } from "@/hooks/useCreateRequests";
import { useFetchRequests } from "@/hooks/useFetchRequests";
import { usePayRequest } from "@/hooks/usePayRequests";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useRef, useState } from "react";
import InlineSVG from "react-inlinesvg";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";

const MarkdownToJSX = dynamic(() => import("markdown-to-jsx"), { ssr: false });

interface Props {
    agent: Agent | null;
    setErrMessage: (e: string) => void;
}

// New chatbox 
const ChatBox: React.FC<Props> = ({ agent, setErrMessage }) => {
    const [copied, setCopied] = useState(false);
    const [switchToCode, setSwitchToCode] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [paid, setPaid] = useState(false);
    const { chat, fetchMessages, deleteMessages } = useChat();
    const { user } = useUser();
    const { address, isConnected } = useAccount();
    const { createRequest } = useCreateRequest();
    const { fetchRequests, fetchSingleRequest } = useFetchRequests();
    const { approveRequest } = useApprove();
    const { payTheRequest } = usePayRequest();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchHistory = async () => {
        if (!user || !user?.sub) {
            return;
        }
        if (!agent?._id) {
            return;
        }
        const response = await fetchMessages({ agentId: agent?._id, userId: user?.sub })
        setMessages(response?.data?.messages)
        console.log("History:", messages)
    }

    useEffect(() => {
        if (agent) {
            fetchHistory();
        }
    }, [agent])

    const clearHistory = async () => {
        if (!user || !user?.sub) {
            return;
        }
        if (!agent?._id) {
            return;
        }
        const response = await deleteMessages({ agentId: agent?._id, userId: user?.sub })
        setMessages([]);
        console.log("Deleted History: ", response)
    }

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

    const handleSend = async () => {
        if (!address) {
            setErrMessage("Please connect your EVM wallet, before start chat!");
            return;
        }
        if (!user || !user.sub || !agent || !inputValue.trim()) return;

        const newMessage: Message = { role: "human", content: inputValue };
        setMessages((prev) => [...prev, newMessage]);
        setInputValue(""); // Clear input field
        setTyping(true);

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

                            // setMessages((prev) => [...prev, { role: "ai", content: "Creating your request!" }]);
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
                                extra: {},
                                agentName: agent?.agentName
                            })

                            console.log("RES CREATION:", createdResponse)

                            if (createdResponse?.success) {
                                setMessages((prev) => [...prev, { role: "ai", content: `${response.data?.lastAiMessage}`, requestId: createdResponse.data.confirmedRequestData?.requestId.trim() }]);
                                // <div hidden>Request Created</div>
                                // <span hidden>${createdResponse.data.confirmedRequestData?.requestId.trim()}</span>
                                setIsCreating(false);
                                return;
                            } else {
                                setMessages((prev) => [...prev, { role: "ai", content: "You request creation has been failed, Please try again later!" }]);
                                setIsCreating(false);
                                return;
                            }
                        }
                        if (toolMessage?.type === "pay") {
                            if (toolMessage?.requestId) {
                                // setMessages((prev) => [...prev, { role: "ai", content: "Start paying your request!" }]);
                                setProcessing(true);
                                const payResponse = await handlePay(toolMessage?.requestId);
                                if (payResponse?.success) {
                                    setMessages((prev) => [...prev, { role: "ai", content: `${response.data?.lastAiMessage}`, requestId: toolMessage?.requestId?.trim() }]);
                                    // <div hidden>Request Created</div>
                                    // <span hidden>${toolMessage?.requestId?.trim()}</span>
                                    setProcessing(false);
                                    return;
                                } else {
                                    setMessages((prev) => [...prev, { role: "ai", content: "You request payment has been failed, Please try again later!" }]);
                                    setProcessing(false);
                                    return;
                                }
                            }

                        }
                    }
                }
                const aiMessage: Message = { role: "ai", content: response.data?.lastAiMessage };
                setMessages((prev) => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setTyping(false);
        }
    };

    const handlePay = async (requestId: string) => {
        try {
            setIsApproving(true);
            await approveRequest({ requestId })
        } catch (approveError) {
            setIsApproving(false);
            return;
        } finally {
            setIsApproving(false);
        }


        try {
            setIsPaying(true);
            const res = await payTheRequest({ requestId });
            if (res?.success) {
                setPaid(true);
                setIsPaying(false);
            } else {
                throw new Error("Payment failed!");
            }
            console.log("RES:", res);
            return res;
        } catch (paymentError) {
            console.error("Error in payment:", paymentError);
            setIsPaying(false);
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className="playgound-box relative h-full border border-[#949494] rounded-xl flex flex-col max-w-[calc(100vw-2rem)]">
            <div className="playground-top w-full h-[4rem] flex items-center justify-between md:px-[1.5rem] px-4">
                <h2 className="text-white">Playground</h2>
                <div className="playground-top-right flex items-center gap-2">
                    <h4 className="text-white text-sm">Switch to</h4>
                    <div className="switch bg-[#ABBDFE] p-1 rounded-md cursor-pointer" onClick={() => setSwitchToCode(!switchToCode)}>
                        {switchToCode ? <InlineSVG
                            src="/icons/chat.svg"
                            className="fill-current svg-white bg-transparent w-5 h-5"
                        /> :
                            <InlineSVG
                                src="/icons/code.svg"
                                className="fill-current svg-white bg-transparent w-5 h-5"
                            />}
                    </div>
                    <div className="switch bg-[#ABBDFE] p-1 rounded-md cursor-pointer" onClick={clearHistory}>
                        <InlineSVG
                            src="/icons/folder-del.svg"
                            className="fill-current svg-white bg-transparent w-5 h-5"
                        />
                    </div>
                </div>
            </div>
            {switchToCode && <div className="playground-center h-full md:p-[2rem] p-4">
                <h2 className="text-[#AFAFAF] text-sm mt-1"><strong className="text-[#ABBDFE] text-md">Title: </strong> {agent?.agentName}</h2>
                <p className="text-[#AFAFAF] text-sm mt-1"><strong className="text-[#ABBDFE] text-md">Instructions: </strong> {agent?.instructions}</p>
                <p className="text-[#AFAFAF] text-sm mt-1">
                    <div className="flex items-center">
                        <strong className="text-[#ABBDFE] text-md">Code Snippet: </strong>
                        <div onClick={copyToClipboard} className="copy h-7 w-7 top-2 right-2 flex items-center justify-center rounded-md cursor-pointer">
                            <InlineSVG
                                src={copied ? "images/clipboard.svg" : "images/copy.svg"}
                                className="fill-current w-4 h-4 text-[#ABBDFE]"
                            />
                        </div>
                    </div> <span className="code-content">{agent?.codeSnippet}</span></p>
            </div>}
            {!switchToCode && <>
                {messages.length === 0 && <div className="playground-center h-full flex justify-center items-center p-[1rem] mb-[4rem]">
                    <p className="text-sm text-[#D9D9D9]">Execute Transactions with AI</p>
                </div>}
                {messages.length > 0 && <div className="playground-center h-full w-full p-[1rem] mb-[4rem] scroll-d overflow-y-auto max-h-[calc(100vh-305px)]">
                    {messages.map((message, index) => {
                        return (
                            <>
                                <div className={`message-div w-full h-auto ${message?.requestId && "flex-col"} mt-2 flex ${message.role === "ai" ? "justify-start" : "justify-end"}`}>
                                    <div className={`message flex items-center gap-2 text-white px-3 py-2 rounded-lg overflow-x-auto ${message.role === "human" ? "bg-[#B2A1FC] max-w-md" : "bg-[#414141] max-w-lg"}`}>
                                        {/* {(isCreating || processing) && index === messages.length - 1 && message.role === "ai" && (
                                            <div className="loading flex items-center">
                                                <div role="status">
                                                    <svg aria-hidden="true" className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                    </svg>
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        )} */}
                                        {/* <p dangerouslySetInnerHTML={{ __html: message?.content }}></p> */}
                                        <MarkdownToJSX
                                            options={{
                                                disableParsingRawHTML: true,
                                                overrides: {
                                                    table: {
                                                        props: {
                                                            className:
                                                                "table-auto w-full border-collapse border border-gray-300",
                                                        },
                                                    },
                                                    th: {
                                                        props: {
                                                            className: "border border-gray-300 p-2 bg-gray-200 text-black min-w-[4rem]",
                                                        },
                                                    },
                                                    td: {
                                                        props: {
                                                            className: "border border-gray-300 p-2",
                                                        },
                                                    }
                                                },
                                            }}
                                        >
                                            {message.content}
                                        </MarkdownToJSX>
                                    </div>
                                    {message?.requestId && <>
                                        <a href={`https://scan.request.network/request/${message.requestId}`} target="_blank" rel="noopener noreferrer" className="approve-btn flex items-center justify-center gap-1 px-2 py-1 mt-1 min-w-[5rem] bg-zinc-200 max-w-[9rem] rounded-3xl border-2 border-zinc-200 hover:border-zinc-400 cursor-pointer">
                                            <h2 className="text-center dark:text-black text-sm">Check Explorer</h2>
                                            <InlineSVG
                                                src="/icons/goto.svg"
                                                className="fill-current bg-transparent text-black w-2.5 h-2.5"
                                            />
                                        </a>
                                    </>}
                                </div>
                                {(isCreating || processing) && index === messages.length - 1 && (
                                    <div className={`whole-div w-full flex items-center gap-1 justify-start`}>
                                        <div className={`relative message px-3 py-2 mb-2 flex items-center gap-1 rounded-lg max-w-xs bg-[#414141]`}>
                                            <div className="loading flex items-center">
                                                <div role="status">
                                                    <svg aria-hidden="true" className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                    </svg>
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                            <p className={`text-sm text-white`}>{isCreating ? "Creating your request..." : processing ? "Your payment is in progress..." : ""}</p>
                                        </div>
                                    </div>
                                )}
                                {typing && index === messages.length - 1 && !isCreating && !processing && <div className={`whole-div w-full flex items-center gap-1 justify-start`}>
                                    <div className={`relative message px-3 py-2 mb-2 flex items-center gap-1 rounded-lg max-w-xs bg-[#414141]`}>
                                        <p className={`text-sm text-white`}>Typing...</p>
                                        {/* <div className="absolute top-[-4px] left-[-7px]">
                                            <InlineSVG
                                                src="images/send.svg"
                                                style={{ transform: 'rotate(245deg)' }}
                                                className="fill-current w-5 h-5 text-[#414141]"
                                            />
                                        </div> */}
                                    </div>
                                </div>}
                            </>
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
                            className="text-[#FFFFFF] text-md w-full py-[0.5rem] bg-transparent rounded-lg border-none outline-none"
                        />
                        <div className="send-box flex items-center justify-center w-[2rem] h-[2rem] rounded-md cursor-pointer" onClick={handleSend}>
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