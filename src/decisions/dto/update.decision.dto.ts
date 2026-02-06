import { z } from 'zod';

export const updateDecisionSchema = z.object({
    action: z.string().min(1).optional(),
    reason: z.string().min(1).optional(),
    outcome: z.string().min(1).optional(),
    context: z.any().optional(),
});

export type UpdateDecisionSchemaDto = z.infer<typeof updateDecisionSchema>;
