import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, ShieldCheck, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// The contract ABI
const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PaymentReceived",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasPaid",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pay",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export function PaymentFlow() {
  const contractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS || "0x3ACA071D6cA66462612d04eB6f31Ab7924F86FF0") as `0x${string}`;
  
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const [paymentAmount, setPaymentAmount] = useState("0.01"); // 0.01 ETH for example

  // Check if user has paid
  const { data: userHasPaid, refetch: refetchHasPaid, isLoading: isCheckingPayment } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "hasPaid",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const { writeContract, data: hash, isPending: isWriting, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Payment Received!", {
        description: "Your on-chain payment was successful.",
      });
      refetchHasPaid();
    }
  }, [isConfirmed, refetchHasPaid]);

  useEffect(() => {
    if (writeError) {
      toast.error("Payment failed", {
        description: writeError.message,
      });
    }
  }, [writeError]);

  const handlePay = () => {
    try {
      writeContract({
        address: contractAddress,
        abi,
        functionName: "pay",
        value: parseEther(paymentAmount),
      } as any);
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const getStatusText = () => {
    if (isWriting) return "Approving in Wallet...";
    if (isConfirming) return "Confirming Transaction...";
    return "Pay Now";
  };

  const isWorking = isWriting || isConfirming;

  return (
    <Card className="w-full max-w-md mx-auto cosmic-card border-white/10 glass-panel">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          {userHasPaid ? <CheckCircle2 className="text-green-500 h-6 w-6" /> : <ShieldCheck className="text-primary h-6 w-6" />}
          OracleBull Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm text-center mb-2">
              Connect your wallet to process the payment and access premium OracleBull features.
            </p>
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isConnecting}
                className="w-full cosmic-button border-primary/20"
                variant="outline"
              >
                {isConnecting && connector.uid === connectors[0]?.uid ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wallet className="mr-2 h-4 w-4" />
                )}
                Connect {connector.name}
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-background/20 rounded-lg p-3 text-sm text-center border border-white/5 truncate">
              Connected: <span className="font-mono text-primary">{address}</span>
            </div>

            {isCheckingPayment ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : userHasPaid ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                <h3 className="font-medium text-green-400">Payment Verified</h3>
                <p className="text-muted-foreground text-sm">You have full access to OracleBull.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-lg font-medium">{paymentAmount} ETH</p>
                  <p className="text-xs text-muted-foreground">Required for premium access</p>
                </div>
                
                <Button 
                  onClick={handlePay} 
                  disabled={isWorking}
                  className="w-full cosmic-button"
                  size="lg"
                >
                  {isWorking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {getStatusText()}
                </Button>

                {hash && (
                  <div className="pt-2 text-center text-xs text-muted-foreground break-all">
                    Tx Hash:{" "}
                    <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {hash}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      {isConnected && (
        <CardFooter className="justify-center border-t border-white/5 pt-4">
          <Button variant="ghost" size="sm" onClick={() => disconnect()} className="text-muted-foreground text-xs hover:text-white">
            Disconnect Wallet
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
