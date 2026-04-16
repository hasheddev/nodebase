import React from "react";

interface IMockLink {
  href: string;
  children?: React.ReactNode;
}

export const MockLink = ({ href, children }: IMockLink) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <a href={href}>{children}</a>;
};
