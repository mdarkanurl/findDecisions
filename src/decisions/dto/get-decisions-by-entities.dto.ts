import { z } from "zod";

export const getDecisionsByEntitiesSchema = z.object({
    entityType: z.string(),
    entity: z.string()
});

export type getDecisionsByEntitiesDto = z.infer<typeof getDecisionsByEntitiesSchema>;