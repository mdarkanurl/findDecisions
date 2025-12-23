import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
    image: z.string().optional(),
    callbackURL: z.string().optional()
});

export type CreateUserDto = z.infer<typeof createUserSchema>;