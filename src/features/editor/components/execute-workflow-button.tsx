import { FlaskConicalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExecuteflow } from "@/features/workflows/hooks/use-workflows";

export const ExecuteWorkflowButton = ({
    workflowId,
}: {
    workflowId: string;
}) => {
    const executeWorkflow = useExecuteflow()
    const handleExecute = () => {
        executeWorkflow.mutate({ id: workflowId })
    }

    return (
        <Button size={"lg"} onClick={handleExecute} disabled={executeWorkflow.isPending}>
            <FlaskConicalIcon className="size-4" />
            Execute workflow
        </Button>
    )
};
