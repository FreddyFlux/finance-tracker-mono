import { auth } from "@clerk/tanstack-react-start/server";
import { createMiddleware } from "@tanstack/react-start";

const authMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await auth();
  if (!user.userId) {
    throw new Error("Unauthorized");
  }
  const result = await next({ context: { userId: user.userId } });
  return result;
});

export default authMiddleware;
