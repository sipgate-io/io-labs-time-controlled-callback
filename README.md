# io-labs-time-controlled-callback

In this example project, we will create an application that answers phone calls and, after a specified time, initiates a callback to the callee.

## What is sipgate.io?

sipgate.io is a collection of APIs, which enables sipgate's customers to build flexible integrations matching their individual needs. It provides interfaces for sending and receiving text messages or faxes, monitoring the call history, and initiating and manipulating calls. In this tutorial, we will use sipgate.io's Push and REST APIs for automatically responding to calls and initiating callbacks after a specified time.

## In this example

The script in this project sets up a simple web server running on your local machine. If someone tries to reach your sipgate number, this webserver will answer the call and play a sound file that announces that all lines are currently busy. It will also initiate a callback to the caller after a specified time using the sipgate.io REST API.
Our application consists of three phases:

1. The application answers a call with a sound clip that announces that customer support is busy and we will get back to the caller soon.
2. A timer is set. After the time elapses, it will initiate the callback.
3. Once the call gets accepted on the callers' phone, the phone call will be redirected to the callee.

### Prerequisites:

- [node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [sipgate personal access token](https://www.sipgate.io/rest-api/authentication#personalAccessToken) with scope `sessions:calls:write`

## Getting started

To launch this example, navigate to a directory where you want the example service to be stored. In your terminal, clone this repository from GitHub and install the required dependencies using `npm install`.

```
git clone https://github.com/sipgate-io/io-labs-time-controlled-callback.git
cd io-labs-time-controlled-callback
npm install
```

## Execution

To run the project on your local machine, follow these steps:

1. In the terminal, run `ssh -R 80:localhost:8080 nokey@localhost.run`
2. There will be some output. Copy the last URL.
3. Duplicate _.env.example_ and rename the file to _.env_
4. Paste the URL from step 2 in `SIPGATE_WEBHOOK_SERVER_ADDRESS`. Your _.env_ should look similar to this:

```
SIPGATE_WEBHOOK_SERVER_ADDRESS=https://d4a3f97e7ccbf2.localhost.run
SIPGATE_WEBHOOK_SERVER_PORT=8080
```

5. Go to your [sipgate app-web account](https://console.sipgate.com/webhooks/urls) and set both the incoming and outgoing webhook URLs as the URL from step 2.
6. Create a personal access token in your [personal access token settings](https://app.sipgate.com/personal-access-token). You will need the `sessions:calls:write` permission to facilitate phone calls. Once you saved the token and token ID, set the `SIPGATE_TOKEN` and `SIPGATE_TOKEN_ID` variables in your _.env_ file.
7. Set the `ANNOUNCEMENT_FILE_URL`, `DEVICE_ID` and `CALLBACK_TIMEOUT` variables in the _.env_ file according to their documentation. You can find the device ID in your [routing settings](https://app.sipgate.com/w0/routing) or by querying the [/{userId}/devices](https://api.sipgate.com/v2/doc#/devices/getDevices) endpoint.
8. Run `npm start` from the root folder of this project.

Now you can call your sipgate account number to test the application.
If the call builds successfully, your terminal will log some information and, after the specified time, the callback gets initiated.
