// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://beea5b04c67407bf25edb1d27c8b9150@o4509853241835520.ingest.de.sentry.io/4511241582542928",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  integrations: [
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  sendDefaultPii: true,
});

//Add this to generatFuncs
//  experimental_telemetry: {
//     isEnabled: true,
//     functionId: "joke_agent",
//     recordInputs: true,
//     recordOutputs: true,
//   },
