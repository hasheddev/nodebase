import { requireAuth } from "@/lib/auth-utils";

interface WorkflowPageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

const Page = async ({ params }: WorkflowPageProps) => {
  await requireAuth();

  const { workflowId } = await params;

  return <p>Workflow id: {workflowId}</p>;
};

export default Page;
