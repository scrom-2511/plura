import { createClient } from "redis";

export const client = createClient();

client.on("error", (err) => {
  // Suppress unhandled redis connection errors when redis server is not running
});

export const connectClient = async (): Promise<boolean> => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    return true;
  } catch (error) {
    return false;
  }
};
