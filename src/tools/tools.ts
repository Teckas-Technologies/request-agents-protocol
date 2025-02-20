import { parseUnits } from "viem";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export interface createRequestToolParams {
    payerAddress: string,
    currency: string,
    amount: string,
    reason: string
}

const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
    },
});

const createRequest = async ({ payerAddress, currency, amount, reason }: createRequestToolParams) => {
    try {
        console.log(payerAddress, currency, amount, reason);

        const data = {
            payerAddress,
            currency,
            amount,
            reason,
        };

        return { success: true, type: "create", data };
    } catch (err) {
        console.error(err); // Log error for debugging
        return { success: false, data: null };
    }
};

const fetchRequests = async ({ address, page, status }: { address: `0x${string}`, page: number, status: string }) => {
    try {
        const limit = 5;
        const identityAddress = address.toLowerCase(); // Normalize address to lowercase for comparison

        console.log(status, page)

        // Fetch all requests for the given identity
        const requests = await requestClient.fromIdentity({
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: identityAddress as string,
        });

        const requestDatas = requests.map((request) => request.getData());

        // Filter requests based on payer address & status
        let filteredRequests = requestDatas.filter((request) => {
            const balance = request.balance;
            const expectedAmount = request.expectedAmount;
            const payerAddress = request.payer?.value?.toLowerCase(); // Ensure payer address is checked safely

            // Include only requests where the provided address matches the payer's address
            if (payerAddress !== identityAddress) {
                return false;
            }

            if (balance && balance.balance !== null && expectedAmount !== null) {
                const balanceAmount = typeof balance.balance === 'string' ? parseFloat(balance.balance) : balance.balance;
                const expectedAmountValue = typeof expectedAmount === 'string' ? parseFloat(expectedAmount) : expectedAmount;

                if (status === "PENDING") {
                    return balanceAmount < expectedAmountValue;
                } else if (status === "PAID") {
                    return balanceAmount >= expectedAmountValue;
                }
            }

            return status === "ALL"; // If status is ALL, include all requests
        });

        // Apply pagination (limit & page number)
        const startIndex = (page - 1) * limit;
        const paginatedRequests = filteredRequests.slice(startIndex, startIndex + limit);

        return { success: true, data: paginatedRequests };

    } catch (err) {
        console.error("Error while fetching requests:", err);
        return { success: false, data: null };
    }
};

export const createRequestTool = tool(
    async (params: any) => await createRequest(params),  // TODO types issue
    {
        name: "create-request",
        description: "It's just form a json to create request to initiate process to the payer to pay the amount to the payee.",
        schema: z.object({
            payerAddress: z.string().describe("The EVM address of the payer to use in the request."),
            currency: z.string().describe("The currency of the payer want to pay in created request. eg. USDT, USDC, ETH, etc..."),
            amount: z.string().describe("The total amount, want to pay to the payee."),
            reason: z.string().describe("Reason for creating request for the payment."),
        }),
    }
);

export const fetchRequestsTool = tool(
    async (params: any) => await fetchRequests(params),  // TODO types issue
    {
        name: "fetch-requests",
        description: "It's just form a json to fetch the requests for the user's by EVM address and status.",
        schema: z.object({
            address: z.string().describe("The EVM address of the user to see the pending payment requests."),
            page: z.number().describe("Page number for the paginated data. Initial page number is 1, If 'next' is 2 like, 'page+1'").default(1),
            status: z.string().describe("The status of the request. 'PENDING' or 'PAID' or 'ALL'. Default is 'PENDING'").default("PENDING")
        }),
    }
);

const calculateStatus = (
    state: string,
    expectedAmount: bigint,
    balance: bigint,
) => {
    if (balance >= expectedAmount) {
        return "Paid";
    }
    if (state === Types.RequestLogic.STATE.ACCEPTED) {
        return "Accepted";
    } else if (state === Types.RequestLogic.STATE.CANCELED) {
        return "Canceled";
    } else if (state === Types.RequestLogic.STATE.CREATED) {
        return "Created";
    } else if (state === Types.RequestLogic.STATE.PENDING) {
        return "Pending";
    }
};


// const identityAddress = address;
// const requests = await requestClient.fromIdentity({
//     type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
//     value: identityAddress as string,
// });
// const requestDatas = requests.map((request) => request.getData());

// // Filtering only pending requests (balance < expectedAmount)
// const pendingRequests = requestDatas.filter((request) => {
//     const balance = request.balance;
//     const expectedAmount = request.expectedAmount;

//     if (balance && balance.balance !== null && expectedAmount !== null) {
//         // Convert balance.balance to number if it's a string
//         const balanceAmount = typeof balance.balance === 'string' ? parseFloat(balance.balance) : balance.balance;
//         // Convert expectedAmount to number if it's not already
//         const expectedAmountValue = typeof expectedAmount === 'string' ? parseFloat(expectedAmount) : expectedAmount;

//         return balanceAmount < expectedAmountValue;
//     }

//     return false; // If balance or expectedAmount is null or invalid, exclude
// });

// return { success: true, data: pendingRequests };