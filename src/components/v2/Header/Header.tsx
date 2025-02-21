"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import "./Header.css"
import axios from "axios";
import { useEffect, useState } from "react";
import { Agent } from "../../SPABody/SPABody";
import { useUser } from "@auth0/nextjs-auth0/client";

interface Props {

}

const Header: React.FC<Props> = ({ }) => {
    const pathName = usePathname();
    const router = useRouter();
    const { isConnected } = useAppKitAccount();
    const { address } = useAccount();
    const { open } = useAppKit();
    const { disconnect } = useDisconnect();
    const [firstAgent, setFirstAgent] = useState<Agent | null>(null);
    const [sideMenu, setSideMenu] = useState(false);
    const { user, error, isLoading } = useUser();

    console.log("USER:", user)

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
        <div className="header fixed z-50 w-full bg-[#111521] h-[6.5rem] flex items-center justify-between 2xl:px-[6rem] xl:px-[5rem] md:px-[4.2rem] px-4">
            <div className="header-left flex items-center justify-start gap-[4rem]">
                <div className="logo-img flex md:flex-row flex-col md:items-center md:gap-2 gap-0 cursor-pointer" onClick={() => router.push("/")}>
                    <h2 className="text-white fw-600 text-2xl leading-none">Request</h2>
                    <h2 className="text-white fw-600 text-2xl leading-none">Agents</h2>
                </div>
            </div>
            <div className="header-center">
                <div className="navs flex items-center h-full gap-[2rem] md:flex hidden">
                    <div className="relative create-nav w-auto h-[5rem] flex items-center justify-center cursor-pointer" onClick={() => router.push("/dashboard")}>
                        <h2 className={`${pathName === "/dashboard" ? "text-[#ABBDFE]" : "text-[#D7D7D7] dark:text-[#D7D7D7]"}`}>Dashboard</h2>
                    </div>
                    <div className="relative create-nav w-auto h-[5rem] flex items-center justify-center cursor-pointer" onClick={() => router.push("/marketplace")}>
                        <h2 className={`${pathName === "/marketplace" ? "text-[#ABBDFE]" : "text-[#D7D7D7] dark:text-[#D7D7D7]"}`}>Marketplace</h2>
                    </div>
                    <div className="relative agents-nav w-auto h-[5rem] flex items-center justify-center cursor-pointer" onClick={() => {
                        const match = firstAgent?.codeSnippet.match(/data-agent-id="([^"]+)"/);
                        const dataId = match ? match[1] : null;
                        if (dataId) {
                            router.push(`/playground?agentId=${dataId}`);
                        } else {
                            router.push(`/playground`);
                        }
                    }}>
                        <h2 className={`${pathName === "/playground" ? "text-[#ABBDFE]" : "text-[#D7D7D7] dark:text-[#D7D7D7]"}`}>Playground</h2>
                    </div>
                </div>
            </div>
            <div className="header-right flex items-center gap-2">
                {!user && <a href="/api/auth/login" className="px-10 py-2 rounded-3xl border border-[#0080FF] text-[#0080FF]">Login</a>}
                <div className="connect-btn flex gap-2 items-center px-6 py-2.5 rounded-lg cursor-pointer" onClick={isConnected && address ? handleViewAccount : handleConnectWallet}>
                    <h2 className="font-medium text-white">{isConnected && address ? "View Account" : "Connect Wallet"}</h2>
                    <img src="/images/right-arrow.png" alt="arrow" className="w-4 h-3.5 object-cover" />
                </div>
                <div className="menu-bar md:hidden" onClick={() => setSideMenu(!sideMenu)}>
                    <img src="/images/menu.png" alt="menu" height={50} width={50} className="object-cover" />
                </div>
            </div>
            {sideMenu && <div className={`absolute h-[100vh] w-full top-[6.5rem] left-0 bg-[#111521] md:hidden`}>
                <div className="side-menus flex flex-col gap-5 mt-3 py-[1rem] px-[2rem]">
                    <div className="menu" onClick={() => { setSideMenu(false); router.push("/dashboard"); }}>
                        <h2 className="text-white text-lg font-medium pb-1">DASHBOARD</h2>
                    </div>
                    <div className="menu" onClick={() => { setSideMenu(false); router.push("/marketplace"); }}>
                        <h2 className="text-white text-lg font-medium pb-1">MARKETPLACE</h2>
                    </div>
                    <div className="menu" onClick={() => { setSideMenu(false); router.push("/playground"); }}>
                        <h2 className="text-white text-lg font-medium pb-1">PLAYGROUND</h2>
                    </div>
                </div>
            </div>}
        </div>
    )

}

export default Header;