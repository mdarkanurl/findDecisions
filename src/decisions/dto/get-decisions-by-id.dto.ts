import { z } from 'zod';

export const getDecisionsByIdSchema = z.string().uuid()
export type getDecisionsByIdDto = z.infer<typeof getDecisionsByIdSchema>;