import { z } from "zod";

export const createInviteSchema = z.object({
    projectId: z.uuid(),
    invitersId: z.uuid()
});

export type createInviteSchemaDto = z.infer<typeof createInviteSchema>;