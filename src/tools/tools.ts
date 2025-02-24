import { parseUnits } from "viem";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { currencies } from "@/config/currencies";

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

const fetchRequests = async ({ address, page, status, agentName }: { address: `0x${string}`, page: number, status: string, agentName: string }) => {
    try {
        const limit = 5;
        const identityAddress = address.toLowerCase(); // Normalize address to lowercase for comparison

        console.log(status, page, address)

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
            const createdWith = request.contentData?.createdWith;
            console.log("Check: ", balance, expectedAmount, payerAddress, createdWith, agentName)

            if (agentName && createdWith !== agentName) {
                console.log("step1 validation")
                return false;
            }

            // Include only requests where the provided address matches the payer's address
            if (payerAddress?.trim() !== identityAddress.trim()) {
                console.log("Addres check: ", payerAddress, identityAddress)
                return false;
            }
            console.log("Passed")

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

        filteredRequests = filteredRequests.map((request) => {
            const currencyKey = `11155111_${request.currencyInfo.value || ""}`;
            const currencyInfo = currencies.get(currencyKey);
            if (currencyInfo) {
                request.expectedAmount = (parseFloat(request.expectedAmount.toString()) / 10 ** currencyInfo.decimals).toString();
            }
            return request;
        });

        // Apply pagination (limit & page number)
        const startIndex = (page - 1) * limit;
        const paginatedRequests = filteredRequests.slice(startIndex, startIndex + limit);

        console.log("Requests", paginatedRequests)

        return { success: true, type: "fetch", data: paginatedRequests };

    } catch (err) {
        console.error("Error while fetching requests:", err);
        return { success: false, data: null };
    }
};

const payRequest = async ({ requestId }: { requestId: string }) => {
    if(requestId) {
        return { success: true, message: "Payment request initiated.", type: "pay", requestId }
    } else {
        return { success: false, message: "Request Id is empty.", data: null }
    }
}

export const createRequestTool = tool(
    async (params: any) => await createRequest(params),  // TODO types issue
    {
        name: "create-request",
        description: "This tool allows a payee (request creator) to initiate a create request for a payer (identified by an EVM address). The request specifies the payer address, amount, currency, and reason for the payment. Ensure all parameters are freshly collected before executing the tool.",
        schema: z.object({
            payerAddress: z.string().describe("The EVM address of the payer to use in the request. ask user to provide payer address."),
            currency: z.string().describe("The currency of the payer want to pay in created request. eg. FAU, USDC, USDT, etc..."),
            amount: z.string().describe("The total amount, want to pay to the payee."),
            reason: z.string().describe("Reason for creating request for the payment."),
        }),
    }
);

export const fetchRequestsTool = tool(
    async (params: any) => await fetchRequests(params),  // TODO types issue
    {
        name: "fetch-requests",
        description: "It's just form a json to fetch the requests for the user's by EVM address and status. Ensure all parameters are freshly collected before executing the tool.",
        schema: z.object({
            address: z.string().describe("The EVM address of the user to see the pending payment requests."),
            page: z.number().describe("Page number for the paginated data. Initial page number is 1, If 'next' is 2 like, 'page+1'. Don't ask page no to the user.").default(1),
            status: z.string().describe("The status of the request. 'PENDING' or 'PAID' or 'ALL'. Default is 'PENDING'").default("PENDING"),
            agentName: z.string().describe("Name of the agent."),
        }),
    }
);

export const payRequestTool = tool(
    async (params: any) => await payRequest(params),  // TODO types issue
    {
        name: "pay-request",
        description: "It's just initiate the payment for the requestId which is from the fetched requests. Ensure all parameters are freshly collected before executing the tool.",
        schema: z.object({
            requestId: z.string().describe("The Id of the payment request.")
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