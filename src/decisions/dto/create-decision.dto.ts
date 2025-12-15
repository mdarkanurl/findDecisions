import { z } from 'zod';
import { Role } from "../../../generated/prisma/enums";

export const createDecisionsSchema = z.object({
  actorType: z.enum(Role),
  actorId: z.string().optional(),
  action: z.string(),
  reason: z.string(),
  context: z.any().nullable().optional(),
  outcome: z.string()
});

export type CreateDecisionDto = z.infer<typeof createDecisionsSchema>;