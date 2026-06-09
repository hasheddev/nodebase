'use client'

import {
    EmptyView,
    EntityContainer,
    EntityHeader,
    EntityItem,
    EntityList,
    EntityPagination,
    EntitySearch,
    ErrorView,
    LoadingView
} from "@/components/entity-components";
import { useCreateWorkflows, useRemoveWorkflows, useSuspenseWorkflows } from "../hooks/use-workflows"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflow-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Workflow } from "@/generated/prisma";
import { WorkflowIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const WorkFlowsList = () => {
    const workflows = useSuspenseWorkflows();
    if (workflows.data.items.length === 0) {
        return <WorkflowsEmpty />
    }

    return (
        <EntityList
            items={workflows.data.items}
            getKey={(workflow) => workflow.id}
            renderItem={(workflow) => <WorkflowItem data={workflow} />}
            emptyView={<WorkflowsEmpty />}
        />
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
    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChage}
            placeholder="Search workflows"
        />
    )
}

export const WorkflowsPagination = () => {
    const workflow = useSuspenseWorkflows()
    const [params, setParams] = useWorkflowsParams()

    return (
        <EntityPagination
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

export const WorkflowsLoading = () => {
    return <LoadingView message="Loading workflows..." />
}

export const WorkflowsError = () => {
    return <ErrorView message="Error Loading workflows" />
}

export const WorkflowsEmpty = () => {
    const createWorkflows = useCreateWorkflows()
    const { handleError, modal } = useUpgradeModal()

    const handleCreate = () => {
        const router = useRouter()
        createWorkflows.mutate(undefined, {
            onError: (error) => {
                handleError(error)
            },
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`)
            }
        })
    }

    return (
        <>
            {modal}
            <EmptyView
                message="You haven't created any workflows yet. Get started by creating your first workflow"
                onNew={handleCreate}
            />
        </>
    )
}

export const WorkflowItem = ({ data }: { data: Workflow }) => {

    const removeWorkflow = useRemoveWorkflows()

    const handleRemove = () => {
        removeWorkflow.mutate({ id: data.id })
    }

    return (
        <EntityItem
            href={`/workflows/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
                    &bull; Created{" "}
                    {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <WorkflowIcon className="size-5 text-muted-foreground" />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeWorkflow.isPending}
        />
    )
}