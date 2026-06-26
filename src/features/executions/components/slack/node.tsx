"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack-channel";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchSlackRequestRealtimeToken } from "./actions";
import { SlackDialog, type SlackFormValues } from "./dialogue";

type SlackNodeData = {
    variableName: string;
    webhookUrl?: string;
    content?: string;
};

export type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
    const [open, setOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: SLACK_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchSlackRequestRealtimeToken,
    });
    const nodeData = props.data;
    const description = nodeData?.content
        ? `Send: ${nodeData.content.slice(0, 40)}`
        : "Not configured";

    const handleSumbit = (values: SlackFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...values,
                        },
                    };
                }
                return node;
            }),
        );
    };

    const handleOpenSettings = () => {
        setOpen(true);
    };

    return (
        <>
            <SlackDialog
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSumbit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/slack.svg"
                name="Slack"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

SlackNode.displayName = "SlackNode";
