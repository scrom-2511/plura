import { z } from 'zod'

export const user = z.object({
  email: z.string(),
  username: z.string(),
  password: z.string()
})
