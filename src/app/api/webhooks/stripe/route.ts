import { type NextRequest, NextResponse } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const workflowId = url.searchParams.get("workflowId");
    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameter workflowId",
        },
        { status: 400 },
      );
    }
    const body = await req.json();
    const data = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: data,
      },
    });
    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("stripe webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "failed to process Stripr event",
      },
      { status: 500 },
    );
  }
}
