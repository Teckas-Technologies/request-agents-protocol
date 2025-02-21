'use client';

import CreateAgent from "@/components/v2/CreateAgent/Createagent";
import Header from "@/components/v2/Header/Header";
import { useAppKit } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Home = () => {
  const [openModal, setOpenModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const { open } = useAppKit();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpenModal(false);
        setMessage("")
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
    if (message) {
      setOpenModal(true);
    }
  }, [message])

  const handleConnectWallet = () => {
    open({ view: 'Connect' });
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Header />
      <CreateAgent setMessage={setMessage} />
      {openModal && <div className="popup fixed top-0 h-[100vh] left-0 right-0 z-50 flex justify-center items-center">
        <div ref={modalRef} className="popup-modal-box max-w-[22rem] min-w-[20rem] min-h-[11rem] bg-[#111521] border border-[#5C5C5C] rounded-lg">
          <div className="pop-top h-[3.5rem] w-full flex items-center justify-center">
            <h2 className="text-center text-white text-lg">Request Agents</h2>
          </div>
          <h2 className="text-center text-white px-[3rem] py-[1rem]">{message}</h2>
          {message && message.includes("create") ? <div className="btns flex justify-center mb-[1rem]">
            <div className="connect-btn py-2 px-5 rounded-lg cursor-pointer" onClick={() => router.push("/playground")}>
              Test your Agent
            </div>
          </div> : message && message.includes("EVM") ? <div className="btns flex justify-center mb-[1rem]">
            <div className="connect-btn py-2 px-5 rounded-lg cursor-pointer" onClick={handleConnectWallet}>
              Connect Wallet
            </div>
          </div> : <div className="btns flex justify-center mb-[1rem]">
            <div className="connect-btn py-2 px-5 rounded-lg cursor-pointer" onClick={() => { setMessage(""); setOpenModal(false); }}>
              Close
            </div>
          </div>}
        </div>
      </div>}
    </div>
  );
};

export default Home;
