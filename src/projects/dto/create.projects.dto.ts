import { z } from 'zod';

export const createProjectsSchema = z.object({
    name: z.string(),
    adminId: z.string(),
    description: z.string().optional()
});

export type createProjectsSchemaDto = z.infer<typeof createProjectsSchema>;