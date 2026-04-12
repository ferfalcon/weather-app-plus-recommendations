import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from "@tanstack/react-router";
import { act, render } from "@testing-library/react";

import { routeTree } from "../routeTree.gen";

type RenderWithAppRouterOptions = {
  initialEntries?: string[];
};

export async function renderWithAppRouter({
  initialEntries = ["/"],
}: RenderWithAppRouterOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
  const history = createMemoryHistory({
    initialEntries,
  });
  const router = createRouter({
    defaultPreload: "intent",
    history,
    routeTree,
    scrollRestoration: true,
  });

  const renderResult = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  await act(async () => {
    await router.load();
  });

  return {
    queryClient,
    router,
    ...renderResult,
  };
}
