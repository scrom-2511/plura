import { createClient } from "redis";

export const client = createClient();

export const connectClient = async (): Promise<void> => {
  // Validate client state and connect only if not open
  if (!client.isOpen) {
    await client.connect();
  }
};
