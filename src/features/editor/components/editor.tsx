"use client";

import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    type Connection,
    Controls,
    type Edge,
    type EdgeChange,
    MiniMap,
    type Node,
    type NodeChange,
    Panel,
    ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "@/features/editor/components/add-node-button";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { editorAtom } from "../store/atoms";

export const EditorLoading = () => <LoadingView message="Loading editor..." />;

export const EditorError = () => <ErrorView message="Error loading editor" />;

export const Editor = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);

    const setEditor = useSetAtom(editorAtom);

    const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
    const [edges, setEdges] = useState<Edge[]>(workflow.edges);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) =>
            setNodes((nodesSnapShot) => applyNodeChanges(changes, nodesSnapShot)),
        [],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) =>
            setEdges((edgesSnapShot) => applyEdgeChanges(changes, edgesSnapShot)),
        [],
    );

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((edgesSnapShot) => addEdge(params, edgesSnapShot)),
        [],
    );

    return (
        <div className="size-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeComponents}
                fitView
                onInit={setEditor}
            // snapGrid={[10, 10]}
            // snapToGrid
            // panOnScroll
            // panOnDrag={false}
            // selectionOnDrag
            //allows for backspace delete
            // proOptions={{
            //     hideAttribution: true
            // }}
            >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-right">
                    <AddNodeButton />
                </Panel>
            </ReactFlow>
        </div>
    );
};
