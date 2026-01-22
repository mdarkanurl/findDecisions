import { z } from 'zod';

export const updateProjectsSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    isPublic: z.boolean().optional()
});

export type updateProjectsSchemaDto = z.infer<typeof updateProjectsSchema>;