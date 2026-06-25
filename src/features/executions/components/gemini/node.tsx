"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini-channel";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchGeminiRequestRealtimeToken } from "./actions";
import { GeminiDialog, type GeminiFormValues } from "./dialogue";

type GeminiNodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
    credentialId?: string;
};

export type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
    const [open, setOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GEMINI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGeminiRequestRealtimeToken,
    });
    const nodeData = props.data;
    const description = nodeData?.userPrompt
        ? `gemini-2.0-flash: ${nodeData.userPrompt.slice(0, 40)}`
        : "Not configured";

    const handleSumbit = (values: GeminiFormValues) => {
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
            <GeminiDialog
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSumbit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/gemini.svg"
                name="Gemini"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

GeminiNode.displayName = "GeminiNode";
