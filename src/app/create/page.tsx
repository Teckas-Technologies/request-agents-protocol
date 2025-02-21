"use client";

import CreateAgent from "@/components/v2/CreateAgent/Createagent";
import Header from "@/components/v2/Header/Header";


const CreateAgentPage = () => {
    return (
        <>
            <Header created={true} />
            <CreateAgent />
        </>
    )
}

export default CreateAgentPage;