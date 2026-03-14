import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useRef } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useBlobStorage() {
  const { identity } = useInternetIdentity();
  const clientRef = useRef<StorageClient | null>(null);

  const getClient = useCallback(async (): Promise<StorageClient> => {
    if (clientRef.current) return clientRef.current;
    const config = await loadConfig();
    const agent = new HttpAgent({
      host: config.backend_host,
      identity: identity ?? undefined,
    });
    if (config.backend_host?.includes("localhost")) {
      await agent.fetchRootKey().catch(() => {});
    }
    const client = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    clientRef.current = client;
    return client;
  }, [identity]);

  const uploadFile = useCallback(
    async (file: File, onProgress?: (pct: number) => void): Promise<string> => {
      const client = await getClient();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await client.putFile(bytes, onProgress);
      const url = await client.getDirectURL(hash);
      return url;
    },
    [getClient],
  );

  return { uploadFile };
}
