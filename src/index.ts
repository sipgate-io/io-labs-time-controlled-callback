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

if (!process.env.CALLBACK_TIMEOUT) {
  console.error("ERROR: You need to specify a callback timeout!\n");
  process.exit();
}

if (!process.env.DEVICE_ID) {
  console.error("ERROR: You need to specify a device ID!\n");
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

const {
  SIPGATE_WEBHOOK_SERVER_ADDRESS: SERVER_ADDRESS,
  SIPGATE_WEBHOOK_SERVER_PORT: PORT,
  ANNOUNCEMENT_FILE_URL,
  DEVICE_ID,
  SIPGATE_TOKEN: TOKEN,
  SIPGATE_TOKEN_ID: TOKENID,
} = process.env;

const CALLBACK_TIMEOUT = parseInt(process.env.CALLBACK_TIMEOUT ?? "60", 10) * 1000;

const client = sipgateIO({ token: TOKEN, tokenId: TOKENID });
const callModule = createCallModule(client);

const initCallback = (to: string) =>
  callModule.initiate({ to, from: DEVICE_ID });

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
      }, CALLBACK_TIMEOUT);
      return WebhookResponse.gatherDTMF({
        maxDigits: 1,
        timeout: 0,
        announcement: ANNOUNCEMENT_FILE_URL,
      });
    });
    webhookServer.onData(() => {
      console.log("Hang up call.");
      return WebhookResponse.hangUpCall();
    });
  });
