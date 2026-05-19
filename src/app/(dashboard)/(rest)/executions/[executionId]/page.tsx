import { requireAuth } from "@/lib/auth-utils";

interface ExecutionPageProps {
  params: Promise<{
    executionId: string;
  }>;
}

const Page = async ({ params }: ExecutionPageProps) => {
  await requireAuth();

  const { executionId } = await params;

  return <p>Execution id: {executionId}</p>;
};

export default Page;
