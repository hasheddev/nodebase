import { faker } from "@faker-js/faker";

import { polarClient } from "@/lib/polar";
import prisma from "@/lib/db";
import { appRouter } from "@/trpc/routers/_app";

jest.mock("random-word-slugs", () => ({
  generateSlug: () => "mocked-four-word-slug",
}));

// Mock the polarClient subscription checker SDK using Jest
jest.mock("@/lib/polar", () => ({
  polarClient: {
    customers: {
      getStateExternal: jest.fn(),
    },
  },
}));

const mockGetStateExternal = polarClient.customers
  .getStateExternal as jest.Mock;

describe("Workflows tRPC Router - Complete Suite", () => {
  let createdUserIds: string[] = [];

  // Helper to spawn a fake user
  async function createFakeUser() {
    const userId = faker.string.uuid();
    const user = await prisma.user.create({
      data: {
        id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        emailVerified: false,
      },
    });
    createdUserIds.push(user.id);
    return user;
  }

  beforeEach(() => {
    createdUserIds = [];
  });

  afterEach(async () => {
    if (createdUserIds.length > 0) {
      // Clean up workflows first, then users
      await prisma.workflow.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
  });

  /* ========================================================================
     CREATE & REMOVE TESTS
     ======================================================================== */

  it("should allow a premium logged-in user to create a workflow", async () => {
    const user = await createFakeUser();

    // Tell Jest to resolve with an active subscription status
    mockGetStateExternal.mockResolvedValue({
      activeSubscriptions: [{ id: "sub_123", status: "active" }],
    });

    const caller = appRouter.createCaller({
      auth: { user: { id: user.id } },
    } as any);
    const newWorkflow = await caller.workflows.create();

    expect(newWorkflow).toBeDefined();
    expect(newWorkflow.userId).toBe(user.id);
    expect(newWorkflow.name).toBe("mocked-four-word-slug");

    // Verify Jest recorded the parameter interaction correctly
    expect(mockGetStateExternal).toHaveBeenCalledWith({
      externalId: user.id,
    });
  });

  it("should throw a FORBIDDEN error when a non-premium user tries to create a workflow", async () => {
    const user = await createFakeUser();

    // Tell Jest to resolve with zero subscriptions active
    mockGetStateExternal.mockResolvedValue({
      activeSubscriptions: [],
    });

    const caller = appRouter.createCaller({
      auth: { user: { id: user.id } },
    } as any);

    // Jest syntax to catch asynchronous rejections safely
    await expect(caller.workflows.create()).rejects.toThrow(
      expect.objectContaining({
        code: "FORBIDDEN",
        message: "Active subscription required",
      }),
    );
  });

  it("should throw an error when a user tries to delete a workflow they don't own", async () => {
    const userA = await createFakeUser();
    const userB = await createFakeUser();

    // Workflow owned by User A
    const workflowA = await prisma.workflow.create({
      data: { name: "User A Project", userId: userA.id },
    });

    // Act as User B
    const caller = appRouter.createCaller({
      auth: { user: { id: userB.id } },
    } as any);

    // This throws because Prisma delete can't find a record matching BOTH workflowA.id AND userB.id
    await expect(
      caller.workflows.remove({ id: workflowA.id }),
    ).rejects.toThrow();
  });

  /* ========================================================================
     UPDATE TESTS
     ======================================================================== */

  it("should allow the owner to update the workflow name", async () => {
    const user = await createFakeUser();
    const workflow = await prisma.workflow.create({
      data: { name: "Old Workflow Name", userId: user.id },
    });

    const caller = appRouter.createCaller({
      auth: { user: { id: user.id } },
    } as any);
    const updated = await caller.workflows.updateName({
      id: workflow.id,
      name: "Brand New Workflow Name",
    });

    expect(updated.name).toBe("Brand New Workflow Name");

    // Double check database reflection
    const dbRecord = await prisma.workflow.findUnique({
      where: { id: workflow.id },
    });
    expect(dbRecord?.name).toBe("Brand New Workflow Name");
  });

  it("should prevent updating a workflow owned by someone else", async () => {
    const userA = await createFakeUser();
    const userB = await createFakeUser();

    const workflowA = await prisma.workflow.create({
      data: { name: "User A Project", userId: userA.id },
    });

    // Act as User B trying to modify User A's file
    const caller = appRouter.createCaller({
      auth: { user: { id: userB.id } },
    } as any);

    // Prisma update throws P2025 error if no matching record is found to update
    await expect(
      caller.workflows.updateName({ id: workflowA.id, name: "Hacked!" }),
    ).rejects.toThrow();
  });

  /* ========================================================================
     GET ONE TESTS
     ======================================================================== */

  it("should return the workflow if requested by the owner", async () => {
    const user = await createFakeUser();
    const workflow = await prisma.workflow.create({
      data: { name: "Secret Blueprint", userId: user.id },
    });

    const caller = appRouter.createCaller({
      auth: { user: { id: user.id } },
    } as any);
    const result = await caller.workflows.getOne({ id: workflow.id });

    expect(result).not.toBeNull();
    expect(result?.name).toBe("Secret Blueprint");
  });

  it("should return null if a user tries to get a workflow belonging to someone else", async () => {
    const userA = await createFakeUser();
    const userB = await createFakeUser();

    const workflowA = await prisma.workflow.create({
      data: { name: "User A Top Secret data", userId: userA.id },
    });

    const caller = appRouter.createCaller({
      auth: { user: { id: userB.id } },
    } as any);
    const result = await caller.workflows.getOne({ id: workflowA.id });

    // Note: Your router uses findUnique with matching id AND userId conditions.
    // If it doesn't match, Prisma safely returns null instead of throwing an error.
    expect(result).toBeNull();
  });

  /* ========================================================================
     GET MANY TESTS
     ======================================================================== */

  it("should only fetch workflows belonging explicitly to the caller context", async () => {
    const userA = await createFakeUser();
    const userB = await createFakeUser();

    // Create 2 workflows for User A and 1 for User B
    await prisma.workflow.createMany({
      data: [
        { name: "User A Work 1", userId: userA.id },
        { name: "User A Work 2", userId: userA.id },
        { name: "User B Work 1", userId: userB.id },
      ],
    });

    const callerA = appRouter.createCaller({
      auth: { user: { id: userA.id } },
    } as any);
    const resultsA = await callerA.workflows.getMany();

    // Verify isolation parameters
    expect(resultsA).toHaveLength(2);
    expect(resultsA.map((w) => w.name)).toContain("User A Work 1");
    expect(resultsA.map((w) => w.name)).toContain("User A Work 2");
    expect(resultsA.map((w) => w.name)).not.toContain("User B Work 1");
  });
});
