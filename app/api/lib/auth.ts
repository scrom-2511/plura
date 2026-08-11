import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<any> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or pass")
                }
                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            email: credentials.email
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
                    throw new Error(err)
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {

            if (session.user) {
                session.user.id = token.id as string
            }

            return session
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    secret: process.env.NEXTAUTH_SECRET
}