"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Loader2 } from "lucide-react";

const MODULE = "0x04000e451b6334e928225593f8e88b18525c3b2e0157c489a776eca3df98f5d9::pledge_board";
const RPC = "https://mainnet.movementnetwork.xyz/v1";

export function PledgeBoard() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pledges, setPledges] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const client = useMemo(() => new Aptos(new AptosConfig({ network: Network.CUSTOM, fullnode: RPC })), []);

  const loadPledges = useCallback(async () => {
    if (!account?.address) return;
    setLoading(true);
    setError(null);
    try {
      const [countRaw] = await client.view({
        payload: {
          function: `${MODULE}::pledge_count`,
          functionArguments: [account.address],
          typeArguments: [],
        },
      });
      const count = Number(countRaw || 0);
      const items: string[] = [];
      for (let i = 0; i < count; i++) {
        const [msg] = await client.view({
          payload: {
            function: `${MODULE}::pledge_at`,
            functionArguments: [account.address, i],
            typeArguments: [],
          },
        });
        items.push(msg as string);
      }
      setPledges(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load pledges");
    } finally {
      setLoading(false);
    }
  }, [account?.address, client]);

  useEffect(() => {
    loadPledges();
  }, [loadPledges]);

  const handleSubmit = async () => {
    if (!account?.address) return;
    if (!message.trim()) {
      setError("Message cannot be empty");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const txn = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE}::pledge`,
          functionArguments: [message.trim()],
          typeArguments: [],
        },
      });
      await client.waitForTransaction({ transactionHash: txn.hash });
      setMessage("");
      await loadPledges();
    } catch (e: any) {
      setError(e?.message || "Failed to submit pledge");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pledge Board (Movement Mainnet)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Input
            placeholder="Write your pledge message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
          />
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit pledge
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Pledges ({pledges.length})</h3>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          {pledges.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">No pledges yet.</p>
          )}
          <ul className="space-y-2">
            {pledges.map((p, idx) => (
              <li key={idx} className="rounded-md border border-border p-3 text-sm break-words">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
