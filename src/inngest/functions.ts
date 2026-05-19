import { inngest } from "./client";
import {createAnthropic} from '@ai-sdk/anthropic'
import {createGoogleGenerativeAI} from '@ai-sdk/google'
import {createOpenAI} from '@ai-sdk/openai'

const anthorpic = createAnthropic()
const google = createGoogleGenerativeAI()
const openai = createOpenAI()

export const helloWorld = inngest.createFunction(
  { id: "helloWorld" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}` };
  },
);
