import { act } from '@testing-library/react';
import { useEffect, useState } from 'react';

export const mockTrpcMutate = jest.fn();
export const mockTrpcQuery = jest.fn();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockMutationOptionsInterceptor = (options: any) => ({
    ...options,
    mutationFn: async (variables: any) => {
        try {
            const res = await mockTrpcMutate(variables);
            if (options.onSuccess) options.onSuccess(res);
            return res;
        } catch (err) {
            if (options.onError) options.onError(err);
            throw err;
        }
    },
});

export const mockQueryOptionsInterceptor = (
    input: any,
    queryKeyName: string,
) => ({
    queryKey: [queryKeyName, input],
    queryFn: async () => {
        return await mockTrpcQuery(input);
    },
});

export const mockUseMutation = jest.fn((hookOptions: any) => {
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [data, setData] = useState<any>(undefined);
    const [error, setError] = useState<any>(null);

    const executeMutation = async (variables: any, mutateOptions?: any) => {
        setStatus('pending');
        setError(null);
        await delay(150);

        try {
            let res;
            if (hookOptions?.mutationFn) {
                res = await hookOptions.mutationFn(variables);
            } else {
                res = await mockTrpcMutate(variables);
            }

            setData(res);
            setStatus('success');

            if (hookOptions?.onSuccess) hookOptions.onSuccess(res);
            if (mutateOptions?.onSuccess) mutateOptions.onSuccess(res);

            return res;
        } catch (err) {
            setError(err);
            setStatus('error');

            if (hookOptions?.onError) hookOptions.onError(err);
            if (mutateOptions?.onError) mutateOptions.onError(err);

            throw err;
        }
    };

    return {
        mutate: (variables: any, mutateOptions?: any) => {
            executeMutation(variables, mutateOptions).catch(() => { });
        },
        mutateAsync: async (variables: any, mutateOptions?: any) => {
            return await executeMutation(variables, mutateOptions);
        },
        isPending: status === 'pending',
        isSuccess: status === 'success',
        isError: status === 'error',
        data,
        error,
        status,
    };
});

export const mockUseQuery = jest.fn((options: any) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(undefined);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            await delay(100);

            if (!isMounted) return;

            try {
                let resolvedData;
                if (options?.queryFn) {
                    resolvedData = options.queryFn();
                    if (resolvedData && typeof resolvedData.then === "function") {
                        resolvedData = await resolvedData;
                    }
                } else {
                    resolvedData = mockTrpcQuery(options?.queryKey);
                    if (resolvedData && typeof resolvedData.then === "function") {
                        resolvedData = await resolvedData;
                    }
                }

                act(() => {
                    setData(resolvedData);
                    setIsLoading(false);
                });
            } catch (err) {
                act(() => {
                    setError(err);
                    setIsLoading(false);
                });
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [JSON.stringify(options?.queryKey)]);

    return {
        data,
        error,
        isLoading: isLoading,
        isFetching: isLoading,
        isSuccess: !isLoading && !error,
        isError: !isLoading && !!error,
        refetch: jest.fn(),
    };
});
