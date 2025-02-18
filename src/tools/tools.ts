import { parseUnits } from "viem";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export interface createRequestToolParams {
    recipientAddress: string,
    currency: string,
    amount: string,
    reason: string
}

const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
    },
});

const createRequest = async ({ recipientAddress, currency, amount, reason }: createRequestToolParams) => {
    try {
        console.log(recipientAddress, currency, amount, reason);

        const data = {
            recipientAddress,
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

const fetchRequests = async ({ address }: { address: `0x${string}` }) => {
    try {
        const data = {
            address
        }
        return { success: true, type: "fetch", data };
    } catch (err) {
        console.log("Error while fetching requests:", err);
        return { success: false, data: null }
    }
};

export const createRequestTool = tool(
    async (params: any) => await createRequest(params),  // TODO types issue
    {
        name: "create-request",
        description: "It's just form a json to create request to the recipient to pay the amount to the payee.",
        schema: z.object({
            recipientAddress: z.string().describe("The EVM address of the recipient to use in the request."),
            currency: z.string().describe("The currency of the recipient want to pay in created request. eg. USDT, USDC, ETH, etc..."),
            amount: z.string().describe("The total amount, want to pay to the payee."),
            reason: z.string().describe("Reason for creating request for the payment."),
        }),
    }
);

export const fetchRequestsTool = tool(
    async (params: any) => await fetchRequests(params),  // TODO types issue
    {
        name: "fetch-requests",
        description: "It's just form a json to fetch all the requests for the user's by EVM address",
        schema: z.object({
            address: z.string().describe("The EVM address of the user to see the pending payment requests.")
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