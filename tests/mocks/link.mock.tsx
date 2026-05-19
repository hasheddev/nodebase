import React, { forwardRef } from "react";

interface IMockLink extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
}

export const MockLink = forwardRef<HTMLAnchorElement, IMockLink>(
  ({ href, children, ...props }, ref) => {
    return (
      <a href={href} ref={ref} {...props}>
        {children}
      </a>
    );
  },
);

MockLink.displayName = "MockLink";
