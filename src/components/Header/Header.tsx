"use client";
import "./Header.css"

const Header = () => {
    return (
        <div className="header fixed z-50 w-full bg-white h-[5rem] flex items-center justify-between md:px-[1.2rem] px-3">
            <div className="header-left flex items-center justify-start gap-[4rem]">
                <div className="logo-img w-[8rem] h-[2.5rem]">
                    <img src="images/rn-logo.svg" alt="logo" className="w-full h-full object-cover" />
                </div>
                <div className="navs flex items-center h-full gap-[2rem] md:flex hidden">
                    <div className="relative create-nav w-auto h-[5rem] flex items-center justify-center">
                        <h2>Create an Agent</h2>
                        <div className="absolute w-full bottom-0 h-1 rounded-3xl bg-[#0BB489]">
                        </div>
                    </div>
                    <div className="relative agents-nav w-auto h-[5rem] flex items-center justify-center">
                        <h2>My Agents</h2>
                        <div className="absolute w-full bottom-0 h-1 rounded-3xl bg-[#0BB489]">
                        </div>
                    </div>
                </div>
            </div>
            <div className="header-right">
                <div className="connect-btn px-5 py-2 border border-[#0BB489] rounded-lg">
                    <h2 className="font-semibold text-[#0BB489]">Connect Wallet</h2>
                </div>
            </div>
        </div>
    )

}

export default Header;