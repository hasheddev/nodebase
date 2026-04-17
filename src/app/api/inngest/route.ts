import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions";

//npx inngest-cli dev
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld],
});
