import z from "zod";
import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const executionssRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string().min(3) }))
    .query(async ({ ctx, input }) => {
      return prisma.execution.findUniqueOrThrow({
        where: {
          id: input.id,
          workflow: { userId: ctx.auth.user.id },
        },
         include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .max(PAGINATION.MAX_PAGE_SIZE)
          .min(PAGINATION.MIN_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const take = pageSize;
      const skip = (page - 1) * pageSize;
      const itemPromise = prisma.execution.findMany({
        skip,
        take,
        where: {
          workflow: { userId: ctx.auth.user.id },
        },
        orderBy: {
          startedAt: "desc",
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      const countPromise = prisma.execution.count({
        where: {
          workflow: { userId: ctx.auth.user.id },
        },
      });
      const [items, totalCount] = await Promise.all([
        itemPromise,
        countPromise,
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;
      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});
