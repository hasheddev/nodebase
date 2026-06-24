import type { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchStripeRealtimetToken } from "./actions";
import { StripeTriggerDialog } from "./dialogue";

export const StripeTriggerNode = memo((props: NodeProps) => {
    const [open, setOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: STRIPE_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchStripeRealtimetToken,
    });

    const handleOpenSettings = () => {
        setOpen(true);
    };

    return (
        <>
            <StripeTriggerDialog open={open} onOpenChange={setOpen} />
            <BaseTriggerNode
                {...props}
                icon='/logos/stripe.svg'
                name="Stripe"
                description="When stripe event is captured"
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                status={nodeStatus}
            />
        </>
    );
});
