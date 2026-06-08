'use client'

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { useCreateWorkflows, useSuspenseWorkflows } from "../hooks/use-workflows"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { router } from "better-auth/api";
import { useRouter } from "next/navigation";

export const WorkFlowsList = () => {
    const workflows = useSuspenseWorkflows();

    return (
        <div className="flex-1 flex justify-center items-center">
            <p>{JSON.stringify(workflows.data, null, 2)}</p>
        </div>
    )
}

export const WorkFlowsHeader = ({ disabled }: { disabled?: boolean }) => {
    const createWorkflows = useCreateWorkflows()
    const router = useRouter()
    const { handleError, modal } = useUpgradeModal()

    const handleCreate = () => {
        createWorkflows.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/wprkflows/${data.id}`)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }
    return (
        <>
            {modal}
            <EntityHeader
                disabled={disabled}
                title="Workflows"
                description="Create and manage your workflows"
                onNew={handleCreate}
                newButtonLabel="New Workflow"
                isCreating={createWorkflows.isPending}
            />
        </>
    )
}

export const WorkFlowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<WorkFlowsHeader />}
            search={<></>}
            pagination={<></>}
        >
            {children}
        </EntityContainer>
    )
}