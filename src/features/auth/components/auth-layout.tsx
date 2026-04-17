import Image from "next/image";
import Link from "next/link";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/50 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Image
                src="/logos/logo.svg"
                width={30}
                height={30}
                alt="nodebase logo"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">Nodebase</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
};
