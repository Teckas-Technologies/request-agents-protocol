import { useState } from "react";

interface Data {
    agentId: string;
    userId: string;
    query: string;
}

interface Threads {
    agentId: string;
    userId: string;
}

export const useChat = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);

    const chat = async (data: Data) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/chat/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Something went wrong!");
            }

            setSuccess(true);
            const reply = await response.json();
            return { success: true, data: reply };
        } catch (error) {
            console.error("Error creating agent:", error);
            setError(error instanceof Error ? error.message : "Something went wrong");
            return { success: false, error: error instanceof Error ? error.message : "Something went wrong" };
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async ({ agentId, userId }: Threads) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/threads/?userId=${userId}&agentId=${agentId}`);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Something went wrong!");
            }

            setSuccess(true);
            const responseJson = await response.json();
            return { success: true, data: responseJson };
        } catch (error) {
            console.error("Error fetching messages:", error);
            setError(error instanceof Error ? error.message : "Something went wrong");
            return { success: false, error: error instanceof Error ? error.message : "Something went wrong" };
        } finally {
            setLoading(false);
        }
    };

    const deleteMessages = async ({ agentId, userId }: Threads) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/threads/?userId=${userId}&agentId=${agentId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Something went wrong!");
            }

            setSuccess(true);
            return { success: true };
        } catch (error) {
            console.error("Error deleting messages:", error);
            setError(error instanceof Error ? error.message : "Something went wrong");
            return { success: false, error: error instanceof Error ? error.message : "Something went wrong" };
        } finally {
            setLoading(false);
        }
    };

    return {
        chat,
        fetchMessages,
        deleteMessages,
        loading,
        error,
        success,
    };
};
