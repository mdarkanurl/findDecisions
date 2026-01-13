import { z } from 'zod';

export const changePasswordSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128)
});

export type changePasswordSchemaDto = z.infer<typeof changePasswordSchema>;