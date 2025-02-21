import { useState } from "react";

interface Data {
    agentName: string;
    instructions: string;
    developerId: string;
}

interface UpdateData {
    agentId: string;
    agentName?: string;
    instructions?: string;
}

export const useAgents = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [totalPages, setTotalPages] = useState();

    // Create a new agent
    const createAgent = async (data: Data) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/new_agents/`, {
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
            const createdAgent = await response.json();
            return { success: true, data: createdAgent };
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

    const fetchAllAgents = async (developerId: string, page: number = 1, search?: string) => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({ devId: developerId, page: String(page) });

            if (search) {
                queryParams.append("search", search);
            }

            const response = await fetch(`/api/new_agents/?${queryParams.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch agents");

            const agents = await response.json();
            setTotalPages(agents.totalPages);
            return agents;
        } catch (error) {
            console.error("Error fetching agents:", error);
            setError("Failed to fetch agents");
        } finally {
            setLoading(false);
        }
    };


    // Fetch a single agent by agentId
    const fetchAgentById = async (agentId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/new_agents/${agentId}`); // No API
            if (!response.ok) throw new Error("Failed to fetch agent");

            const agent = await response.json();
            return agent;
        } catch (error) {
            console.error("Error fetching agent:", error);
            setError("Failed to fetch agent");
        } finally {
            setLoading(false);
        }
    };

    // Update an agent
    const updateAgent = async (data: UpdateData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/new_agents/${data.agentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to update agent");

            setSuccess(true);
            const updatedAgent = await response.json();
            return updatedAgent;
        } catch (error) {
            console.error("Error updating agent:", error);
            setError("Failed to update agent");
        } finally {
            setLoading(false);
        }
    };

    // Delete an agent
    const deleteAgent = async (agentId: string) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/new_agents/${agentId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete agent");

            setSuccess(true);
            return response.json();
        } catch (error) {
            console.error("Error deleting agent:", error);
            setError("Failed to delete agent");
        } finally {
            setLoading(false);
        }
    };

    return {
        createAgent,
        fetchAllAgents,
        fetchAgentById,
        updateAgent,
        deleteAgent,
        totalPages,
        loading,
        error,
        success,
    };
};
