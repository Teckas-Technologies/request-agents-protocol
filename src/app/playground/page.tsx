"use client";

import Header from "@/components/Header/Header";
import PlayGround from "@/components/PlayGround/PlayGround";
import { Agent } from "@/components/SPABody/SPABody";
import { useDeveloper } from "@/contexts/DeveloperContext";
import axios from "axios";
import { Suspense, useEffect, useState } from "react";


const PlayGroundPage = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const { developerId } = useDeveloper();
    console.log("Dev Id:", developerId)
    const fetchAgents = async (id: string) => {
        try {
            const response = await axios.get('/api/agents', { params: { devId: id } });
            setAgents(response.data);
        } catch (err) {
            console.error('Error fetching agents:', err);
        }
    };

    useEffect(() => {
        if (developerId) {
            fetchAgents(developerId);
        }
    }, [developerId]);

    return (
        <>
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
                <PlayGround agents={agents} />
            </Suspense>
        </>
    )
}

export default PlayGroundPage;