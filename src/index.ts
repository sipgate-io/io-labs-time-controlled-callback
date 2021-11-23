import * as dotenv from "dotenv";
import {
  createCallModule,
  createWebhookModule,
  sipgateIO,
  WebhookDirection,
  WebhookResponse,
} from "sipgateio";

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

if (!process.env.SIPGATE_TOKEN) {
  console.error("ERROR: You need to provide a valid personal access token!\n");
  process.exit();
}

if (!process.env.SIPGATE_TOKEN_ID) {
  console.error("ERROR: You need to provide a personal access token ID!\n");
  process.exit();
}

const SERVER_ADDRESS = process.env.SIPGATE_WEBHOOK_SERVER_ADDRESS;
const PORT = process.env.SIPGATE_WEBHOOK_SERVER_PORT;
const { ANNOUNCEMENT_FILE_URL } = process.env;

const token = process.env.SIPGATE_TOKEN ?? "";
const tokenId = process.env.SIPGATE_TOKEN_ID ?? "";

const client = sipgateIO({ token, tokenId });
const callModule = createCallModule(client);

function initCallback(to: string) {
  console.log("Initialize callback.");
  const from = "deviceid";
  callModule.initiate({ to, from });
}

createWebhookModule()
  .createServer({
    port: PORT,
    serverAddress: SERVER_ADDRESS,
  })
  .then((webhookServer) => {
    webhookServer.onNewCall((newCallEvent) => {
      if (newCallEvent.direction === WebhookDirection.OUT) {
        console.log(
          `New outgoing call from ${newCallEvent.from} to ${newCallEvent.to}`,
        );
        return undefined;
      }
      console.log(`New call from ${newCallEvent.from} to ${newCallEvent.to}`);

      setTimeout(() => {
        initCallback(newCallEvent.from);
      }, 60000);
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
