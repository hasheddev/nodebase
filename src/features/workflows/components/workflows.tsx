'use client'

import { EntityContainer, EntityHeader, EntityPagination, EntitySearch } from "@/components/entity-components";
import { useCreateWorkflows, useSuspenseWorkflows } from "../hooks/use-workflows"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflow-params";
import { useEntitySearch } from "@/hooks/use-entity-search";

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
                router.push(`/workflows/${data.id}`)
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

export const WorkflowsSearch = () => {
    const [params, setParams] = useWorkflowsParams()

    const { searchValue, onSearchChage } = useEntitySearch({ params, setParams })
    return (<EntitySearch value={searchValue} onChange={onSearchChage} placeholder="Search workflows" />)
}

export const WorkflowsPagination = () => {
    const workflow = useSuspenseWorkflows()
    const [params, setParams] = useWorkflowsParams()

    return (<EntityPagination
        disabled={workflow.isFetching}
        totalPages={workflow.data.totalPages}
        page={workflow.data.page}
        onPageChange={(page) => setParams({ ...params, page })}
    />)
}

export const WorkFlowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<WorkFlowsHeader />}
            search={<WorkflowsSearch />}
            pagination={<WorkflowsPagination />}
        >
            {children}
        </EntityContainer>
    )
}