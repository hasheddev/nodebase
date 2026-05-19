import { requireAuth } from "@/lib/auth-utils";

interface CredentialPageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

const Page = async ({ params }: CredentialPageProps) => {
  await requireAuth();

  const { credentialId } = await params;

  return <p>Credential id: {credentialId}</p>;
};

export default Page;
