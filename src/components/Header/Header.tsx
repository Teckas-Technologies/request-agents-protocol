"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import "./Header.css"
import axios from "axios";
import { useEffect, useState } from "react";
import { useDeveloper } from "@/contexts/DeveloperContext";
import { Agent } from "../SPABody/SPABody";

interface Props {
    created: boolean;
}

const Header: React.FC<Props> = ({created}) => {
    const pathName = usePathname();
    const router = useRouter();
    const { isConnected } = useAppKitAccount();
    const { address } = useAccount();
    const { open } = useAppKit();
    const { disconnect } = useDisconnect();
    const { developerId }: any = useDeveloper();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [firstAgent, setFirstAgent] = useState<Agent | null>(null);

    const fetchAgents = async (id: string) => {
        try {
            const response = await axios.get('/api/agents', { params: { devId: id } });
            setAgents(response.data);

            // Set the first agent directly from the response
            if (response.data.length > 0) {
                setFirstAgent(response.data[0]);
            } else {
                setFirstAgent(null); // Reset if no agents
            }
        } catch (err) {
            console.error('Error fetching agents:', err);
            setFirstAgent(null); // Handle errors by resetting
        }
    };

    useEffect(() => {
        if (developerId) {
            fetchAgents(developerId);
        }
    }, [developerId, created]);

    const handleConnectWallet = () => {
        open({ view: 'Connect' });
    }

    const handleDisconnect = () => {
        disconnect();
    }

    const handleViewAccount = () => {
        open({ view: 'Account' });
    }
    return (
        <div className="header fixed z-50 w-full bg-white h-[5rem] flex items-center justify-between md:px-[1.2rem] px-3">
            <div className="header-left flex items-center justify-start gap-[4rem]">
                <div className="logo-img w-[10rem] h-[3rem] cursor-pointer" onClick={() => router.push("/")}>
                    <img src="images/request-network-logo.png" alt="logo" className="w-full h-full object-cover" />
                </div>
                <div className="navs flex items-center h-full gap-[2rem] md:flex hidden">
                    <div className="relative create-nav w-auto h-[5rem] flex items-center justify-center cursor-pointer" onClick={() => router.push("/")}>
                        <h2>Home</h2>
                        {pathName === "/" && <div className="absolute w-full bottom-0 h-1 rounded-3xl bg-[#0BB489]">
                        </div>}
                    </div>
                    <div className="relative agents-nav w-auto h-[5rem] flex items-center justify-center cursor-pointer" onClick={() => {
                        const match = firstAgent?.codeSnippet.match(/data-id="([^"]+)"/);
                        const dataId = match ? match[1] : null;
                        if (dataId) {
                            router.push(`/playground?agentId=${dataId}`);
                        }
                    }}>
                        <h2>Playground</h2>
                        {pathName === "/playground" && <div className="absolute w-full bottom-0 h-1 rounded-3xl bg-[#0BB489]">
                        </div>}
                    </div>
                </div>
            </div>
            <div className="header-right">
                {pathName === "/playground" ? <div className="connect-btn px-5 py-2 border border-[#0BB489] rounded-lg cursor-pointer" onClick={isConnected && address ? handleViewAccount : handleConnectWallet}>
                    <h2 className="font-semibold text-[#0BB489]">{isConnected && address ? "View Account" : "Connect Wallet"}</h2>
                </div> : <div className="connect-btn px-5 py-2 border border-[#0BB489] rounded-lg cursor-pointer" onClick={() => {
                    const match = firstAgent?.codeSnippet.match(/data-id="([^"]+)"/);
                    const dataId = match ? match[1] : null;
                    if (dataId) {
                        router.push(`/playground?agentId=${dataId}`);
                    }
                }}>
                    <h2 className="font-semibold text-[#0BB489]">Playground</h2>
                </div>}
            </div>
        </div>
    )

}

export default Header;