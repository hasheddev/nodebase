"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai-channel";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchOpenAiRequestRealtimeToken } from "./actions";
import { OpenAiDialog, type OpenAiFormValues } from "./dialogue";

type OpenAiNodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
    credentialId?: string;
};

export type OpenAiNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
    const [open, setOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENAI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchOpenAiRequestRealtimeToken,
    });
    const nodeData = props.data;
    const description = nodeData?.userPrompt
        ? `gpt-4: ${nodeData.userPrompt.slice(0, 40)}`
        : "Not configured";

    const handleSumbit = (values: OpenAiFormValues) => {
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
            <OpenAiDialog
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSumbit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/openai.svg"
                name="OpenAI"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

OpenAiNode.displayName = "OpenAiNode";
