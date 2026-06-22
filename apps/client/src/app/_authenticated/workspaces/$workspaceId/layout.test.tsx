import { describe, expect, it, vi } from "vitest";

import { Route } from "./layout";

type BeforeLoadContext = Parameters<
  NonNullable<typeof Route.options.beforeLoad>
>[0];

const createApolloClient = () => ({
  query: vi.fn().mockResolvedValue({
    data: {
      workspace: { id: "workspace-id" },
      currentWorkspaceMember: { id: "member-id" },
    },
  }),
});

const createBeforeLoadContext = (
  apolloClient: ReturnType<typeof createApolloClient>,
  cause: BeforeLoadContext["cause"],
): BeforeLoadContext =>
  ({
    context: { apolloClient },
    cause,
    params: { workspaceId: "workspace-id" },
  }) as unknown as BeforeLoadContext;

describe("workspace layout route", () => {
  it("validates workspace access by route workspace id for stay navigations", async () => {
    const apolloClient = createApolloClient();

    await Route.options.beforeLoad?.(
      createBeforeLoadContext(apolloClient, "stay"),
    );

    expect(apolloClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: "cache-first",
        variables: {
          workspaceId: "workspace-id",
        },
      }),
    );
  });

  it("validates workspace access by route workspace id when entering", async () => {
    const apolloClient = createApolloClient();

    await Route.options.beforeLoad?.(
      createBeforeLoadContext(apolloClient, "enter"),
    );

    expect(apolloClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        errorPolicy: "ignore",
        fetchPolicy: "cache-first",
        variables: {
          workspaceId: "workspace-id",
        },
      }),
    );
  });
});
