import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data } = await authClient.customer.state();
      return data;
    },
  });
};

export const useHasActiveSuvsription = () => {
  const { data: customerState, isLoading, ...rest } = useSubscription();
  const hasActiveSubscription =
    customerState?.activeSubscriptions &&
    customerState.activeSubscriptions.length > 0;
  return {
    hasActiveSubscription,
    isLoading,
    rest,
    subscription: customerState?.activeSubscriptions?.[0],
  };
};
