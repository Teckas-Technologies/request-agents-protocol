import { useState } from "react";

interface Data {
    agentId: string;
    userId: string;
    query: string;
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
                const data = await response.json()

                if (response.status === 400) {
                    throw new Error(data.error)
                } else {
                    throw new Error("Something went wrong!");
                }
            }

            setSuccess(true);
            const reply = await response.json();
            return { success: true, data: reply };
        } catch (error) {
            console.error("Error creating agent:", error);

            let errorMessage = "Something went wrong"; // Default error message

            // Handle cases where error is an instance of Error
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "object" && error !== null && "error" in error) {
                errorMessage = (error as any).error; // Extract message from API response
            }

            setError(errorMessage); // Set proper error message for UI
            return { error: errorMessage, success: false };
        } finally {
            setLoading(false);
        }
    };

    return {
        chat,
        loading,
        error,
        success,
    };
};
