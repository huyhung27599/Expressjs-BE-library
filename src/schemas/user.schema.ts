import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(1).max(255),
    email: z.string().email(),
    password: z.string().min(8).max(255),
  }),
});
