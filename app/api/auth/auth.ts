import prisma from "@/lib/prisma"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials): Promise<any> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or pass")
                }
                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            email: String(credentials.email)
                        }
                    })
                    if (!user) {
                        throw new Error("No user found")
                    }

                    if (user.password === credentials.password) {
                        return {
                            id: user.id, email: user.email
                        }
                    }
                } catch (err: any) {
                    throw new Error(err.message || err.toString())
                }
            }
        }),
    ],
})