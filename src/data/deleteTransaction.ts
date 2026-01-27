import db from "@/db";
import { transactionsTable } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";

const schema = z.object({
  transactionId: z.number(),
});

export const deleteTransaction = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
  .handler(async ({ context, data }) => {
    await db
      .delete(transactionsTable)
      .where(
        and(
          eq(transactionsTable.id, data.transactionId),
          eq(transactionsTable.userId, context.userId)
        )
      );
  });
