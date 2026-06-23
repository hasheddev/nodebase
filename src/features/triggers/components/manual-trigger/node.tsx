import type { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/manual-trigger";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchManualRealtimetToken } from "./actions";
import { ManualTriggerDialog } from "./dialogue";

export const ManualTriggerNode = memo((props: NodeProps) => {
    const [open, setOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: MANUAL_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchManualRealtimetToken,
    });

    const handleOpenSettings = () => {
        setOpen(true);
    };

    return (
        <>
            <ManualTriggerDialog open={open} onOpenChange={setOpen} />
            <BaseTriggerNode
                {...props}
                icon={MousePointerIcon}
                name="When clicking 'Execute workflow'"
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                status={nodeStatus}
            />
        </>
    );
});
