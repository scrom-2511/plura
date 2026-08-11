import prisma from "@/lib/prisma"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
// // Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
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