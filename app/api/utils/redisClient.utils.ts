import { createClient } from "redis";

export const client = createClient();

export const connectClient = async (): Promise<void> => {
  if (!client.isOpen) {
    await client.connect();
  }
};
