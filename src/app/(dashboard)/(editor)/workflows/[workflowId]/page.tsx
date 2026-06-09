import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EditorHeader } from "@/components/editor-header";
import {
    Editor,
    EditorError,
    EditorLoading,
} from "@/features/editor/components/editor";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

interface WorkflowPageProps {
    params: Promise<{
        workflowId: string;
    }>;
}

const Page = async ({ params }: WorkflowPageProps) => {
    await requireAuth();

    const { workflowId } = await params;
    prefetchWorkflow(workflowId);

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<EditorError />}>
                <Suspense fallback={<EditorLoading />}>
                    <EditorHeader workflowId={workflowId} />
                    <main className="flex-1">
                        <Editor workflowId={workflowId} />
                    </main>
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    );
};

export default Page;
