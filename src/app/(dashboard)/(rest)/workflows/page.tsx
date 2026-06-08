import { WorkFlowsContainer, WorkFlowsList } from "@/features/workflows/components/workflows";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from 'react-error-boundary'

export default async function Page() {
    await requireAuth();
    prefetchWorkflows();

    return (
        <WorkFlowsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<p>Error</p>}>
                    <Suspense fallback={<p>Loading</p>}>
                        <WorkFlowsList />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </WorkFlowsContainer>
    )
}
