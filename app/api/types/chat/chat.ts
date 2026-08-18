import { z } from 'zod'

export const createChatSchema = z.object({
  uuid: z.string(),
  chatName: z.string(),
  chatSummary: z.string(),
  userId: z.string(),
})
