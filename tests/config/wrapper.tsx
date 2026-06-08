import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { useState } from 'react';

import { TRPCProvider } from '../../src/trpc/client';
import { makeQueryClient } from '../../src/trpc/query-client';
import type { AppRouter } from '../../src/trpc/routers/_app';

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => makeQueryClient());

    const [trpcClient] = useState(() =>
        createTRPCClient<AppRouter>({
            links: [
                httpBatchLink({
                    url: 'http://localhost:3000/api/trpc',
                }),
            ],
        })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {children}
            </TRPCProvider>
        </QueryClientProvider>
    );
};