import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { APP_STATUS } from "./useCreateRequests";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import { providers, Signer } from "ethers";
import { swapErc20FeeProxyRequest } from "@requestnetwork/payment-processor";

interface Data {
    requestId: string;
}

export const usePayRequest = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);
    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();
    const [status, setStatus] = useState(APP_STATUS.AWAITING_INPUT);
    const [requestData, setRequestData] = useState<Types.IRequestDataWithEvents | undefined>();

    const swapPayRequest = async (data: Data) => {
        if (!address || !walletClient) {
            console.error("No address or wallet client found!");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const requestClient = new RequestNetwork({
                nodeConnectionConfig: { baseURL: 'https://sepolia.gateway.request.network/' }
            });
            const _request = await requestClient.fromRequestId("0156f5de85c4b789a52c25e6170b15d545a1d3b0f2503197b157c7ff78b7527c6b");
            const requestDataWithEvents = await _request.waitForConfirmation();
            setRequestData(requestDataWithEvents);

            const provider = new providers.Web3Provider(walletClient as any);
            const signer: Signer = provider.getSigner();

            // Define swap settings
            const swapSettings = {
                deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
                maxInputAmount: "1000000000000000000", // Example max amount in Wei
                path: ["0xTokenToSwap", "0xRequestCurrencyToken"] // Replace with actual token addresses
            };

            // Perform the swap and pay request
            const tx = await swapErc20FeeProxyRequest(requestDataWithEvents, signer, swapSettings);
            await tx.wait();
            setSuccess(true);
        } catch (error) {
            console.error('Error processing swap and payment:', error);
            setError('Failed to process swap and payment');
        } finally {
            setLoading(false);
        }
    };

    return { swapPayRequest, requestData, status, setStatus, loading, error, success };
};
