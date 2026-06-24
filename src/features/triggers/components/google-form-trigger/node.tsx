import type { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchGoogleFormRealtimetToken } from "./actions";
import { GoogleFormTriggerDialog } from "./dialogue";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
    const [open, setOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGoogleFormRealtimetToken,
    });

    const handleOpenSettings = () => {
        setOpen(true);
    };

    return (
        <>
            <GoogleFormTriggerDialog open={open} onOpenChange={setOpen} />
            <BaseTriggerNode
                {...props}
                icon='/logos/googleform.svg'
                name="Google Form"
                description="When form is submitted"
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                status={nodeStatus}
            />
        </>
    );
});
