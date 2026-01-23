import { z } from 'zod';

export const updateProjectsSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.isPublic !== undefined,
    {
      message: 'At least one field (name, description, or isPublic) must be provided',
    }
  );

export type UpdateProjectsSchemaDto = z.infer<typeof updateProjectsSchema>;
