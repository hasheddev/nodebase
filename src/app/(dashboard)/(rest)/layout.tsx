import { AppHeader } from "@/components/app-header";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    
      <>
      <AppHeader/>
      <main className="flex-1">{children}</main>
      </>
   
  );
}
