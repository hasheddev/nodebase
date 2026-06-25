"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic-channel";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchAnthropicRequestRealtimeToken } from "./actions";
import { AnthropicDialog, type AnthropicFormValues } from "./dialogue";

type AnthropicNodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
    credentialId?: string;
};

export type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
    const [open, setOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: ANTHROPIC_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchAnthropicRequestRealtimeToken,
    });
    const nodeData = props.data;
    const description = nodeData?.userPrompt
        ? `claude-sonnet-4-0: ${nodeData.userPrompt.slice(0, 40)}`
        : "Not configured";

    const handleSumbit = (values: AnthropicFormValues) => {
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
            <AnthropicDialog
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSumbit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/anthropic.svg"
                name="Anthropic"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

AnthropicNode.displayName = "AnthropicNode";
