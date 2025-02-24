"use client";

import Header from "@/components/v2/Header/Header";
import Playground from "@/components/v2/Playground/Playground";
import { customSwitchNetwork } from "@/contexts/ContextProvider";
import { useAppKit } from "@reown/appkit/react";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

const PlayGroundPage = () => {

    const [openModal, setOpenModal] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [errMessage, setErrMessage] = useState("");
    const { open } = useAppKit();
    const { address } = useAccount();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setOpenModal(false);
                setErrMessage("")
            }
        };

        if (openModal) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openModal]);

    useEffect(() => {
        if (errMessage) {
            setOpenModal(true);
        }
    }, [errMessage])

    const handleConnectWallet = () => {
        open({ view: 'Connect' });
    }

    useEffect(() => {
        customSwitchNetwork("11155111");
    }, [address])

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <Header />
            <Playground setErrMessage={setErrMessage} />
            {openModal && <div className="popup fixed top-0 h-[100vh] left-0 right-0 z-50 flex justify-center items-center">
                <div ref={modalRef} className="popup-modal-box max-w-[22rem] min-w-[20rem] min-h-[11rem] bg-[#111521] border border-[#5C5C5C] rounded-lg">
                    <div className="pop-top h-[3.5rem] w-full flex items-center justify-center">
                        <h2 className="text-center text-white text-lg">Request Agents</h2>
                    </div>
                    <h2 className="text-center text-white px-[3rem] py-[1rem]">{errMessage}</h2>
                    {errMessage && errMessage.includes("EVM") ? <div className="btns flex justify-center mb-[1rem]">
                        <div className="connect-btn py-2 px-5 rounded-lg cursor-pointer" onClick={handleConnectWallet}>
                            Connect Wallet
                        </div>
                    </div> : <div className="btns flex justify-center mb-[1rem]">
                        <div className="connect-btn py-2 px-5 rounded-lg cursor-pointer" onClick={() => { setErrMessage(""); setOpenModal(false); }}>
                            Close
                        </div>
                    </div>}
                </div>
            </div>}
        </div>
    )
}

export default PlayGroundPage;