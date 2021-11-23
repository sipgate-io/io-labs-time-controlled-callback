import * as dotenv from "dotenv";
import { createWebhookModule, WebhookResponse } from "sipgateio";

dotenv.config();

if (!process.env.SIPGATE_WEBHOOK_SERVER_ADDRESS) {
  console.error(
    "ERROR: You need to set a server address to receive webhook events!\n",
  );
  process.exit();
}

if (!process.env.SIPGATE_WEBHOOK_SERVER_PORT) {
  console.error(
    "ERROR: You need to set a server port to receive webhook events!\n",
  );
  process.exit();
}

if (!process.env.ANNOUNCEMENT_FILE_URL) {
  console.error("ERROR: You need to specify an announcement file!\n");
  process.exit();
}

const SERVER_ADDRESS = process.env.SIPGATE_WEBHOOK_SERVER_ADDRESS;
const PORT = process.env.SIPGATE_WEBHOOK_SERVER_PORT;
const { ANNOUNCEMENT_FILE_URL } = process.env;

createWebhookModule()
  .createServer({
    port: PORT,
    serverAddress: SERVER_ADDRESS,
  })
  .then((webhookServer) => {
    webhookServer.onNewCall((newCallEvent) => {
      console.log(`New call from ${newCallEvent.from} to ${newCallEvent.to}`);
      return WebhookResponse.gatherDTMF({
        maxDigits: 1,
        timeout: 0,
        announcement: ANNOUNCEMENT_FILE_URL,
      });
    });
    webhookServer.onData((_) => {
      console.log("Hang up call.");
      return WebhookResponse.hangUpCall();
    });
  });
