"use client";

import { formatDistanceToNow } from "date-fns";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import {
    EmptyView,
    EntityContainer,
    EntityHeader,
    EntityItem,
    EntityList,
    EntityPagination,
    ErrorView,
    LoadingView,
} from "@/components/entity-components";
import { type Execution, ExecutionStatus } from "@/generated/prisma";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";

export const ExecutionsList = () => {
    const executions = useSuspenseExecutions();
    if (executions.data.items.length === 0) {
        return <ExecutionsEmpty />;
    }

    return (
        <EntityList
            items={executions.data.items}
            getKey={(execution) => execution.id}
            renderItem={(execution) => <ExecutionsItem data={execution} />}
            emptyView={<ExecutionsEmpty />}
        />
    );
};

export const ExecutionsHeader = ({ disabled }: { disabled?: boolean }) => {
    return (
        <EntityHeader
            disabled={disabled}
            title="Executions"
            description="View your workflow execution history"
        />
    );
};

export const ExecutionsPagination = () => {
    const executions = useSuspenseExecutions();
    const [params, setParams] = useExecutionsParams();

    return (
        <EntityPagination
            disabled={executions.isFetching}
            totalPages={executions.data.totalPages}
            page={executions.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    );
};

export const ExecutionsContainer = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <EntityContainer
            header={<ExecutionsHeader />}
            pagination={<ExecutionsPagination />}
        >
            {children}
        </EntityContainer>
    );
};

export const ExecutionsLoading = () => {
    return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
    return <ErrorView message="Error Loading executions" />;
};

export const ExecutionsEmpty = () => {
    return (
        <EmptyView message="You haven't executed any workflow yet. Get started by executing your first workflow" />
    );
};

type Workflow = {
    workflow: {
        id: string;
        name: string;
    };
};

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="size-5 animate-spin text-blue-600" />;
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className="size-5 text-green-600" />;
        case ExecutionStatus.FAILED:
            return <XCircleIcon className="size-5 text-red-600" />;
        default:
            return <ClockIcon className="size-5 text-muted-foreground" />;
    }
};

const formatStatus = (status: ExecutionStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
}

export const ExecutionsItem = ({ data }: { data: Execution & Workflow }) => {
    const duration = data.completedAt
        ? Math.round(
            new Date(data.completedAt).getTime() -
            new Date(data.startedAt).getTime(),
        ) / 1000
        : null;

    const postfix = duration ? <> &bull; Took {duration}s</> : null;
    const subtitle = (
        <>
            {data.workflow.name} &bull; Started{" "}
            {formatDistanceToNow(data.startedAt, { addSuffix: true })}
            {postfix}
        </>
    );
    return (
        <EntityItem
            href={`/executions/${data.id}`}
            title={formatStatus(data.status)}
            subtitle={subtitle}
            image={<div className="size-8 flex items-center justify-center">
                {getStatusIcon(data.status)}
            </div>}
        />
    );
};
