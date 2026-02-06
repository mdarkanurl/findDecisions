import { z } from 'zod';

export const createDecisionSchema = z.object({
    projectId: z.string().uuid(),
    action: z.string().min(1),
    reason: z.string().min(1),
    outcome: z.string().min(1),
    context: z.any().optional(),
});

export type CreateDecisionSchemaDto = z.infer<typeof createDecisionSchema>;
