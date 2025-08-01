import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import DiscordProvider from 'next-auth/providers/discord';
import dbConnect from '@/src/app/lib/dbConnect';
import User from '@/src/app/models/User';
import { comparePassword } from '@/src/app/lib/auth';
import { userLoginSchema } from '@/src/lib/validations';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const validated = userLoginSchema.safeParse(credentials);
        if (!validated.success) {
          throw new Error('Invalid input');
        }

        await dbConnect();
        const user = await User.findOne({ email: validated.data.email });
        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await comparePassword(validated.data.password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/signup',
    error: '/login', // Redirect to login on error
  },
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      if (account?.provider !== 'credentials') {
        try {
          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            // If user exists, link the new OAuth provider
            if (!existingUser.providerAccountId) {
                existingUser.provider = account?.provider as string;
                existingUser.providerAccountId = account?.providerAccountId;
                existingUser.avatar = existingUser.avatar ?? user.image;
                await existingUser.save();
            }
            return true;
          } else {
            // Create a new user for the OAuth login
            await User.create({
              name: user.name,
              email: user.email,
              avatar: user.image,
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
              lastLogin: new Date(),
            });
          }
        } catch (error) {
          console.error('OAuth sign-in error:', error);
          return false;
        }
      }
      
      // Update last login for all sign-ins
      if (user.email) {
        await User.findOneAndUpdate(
          { email: user.email },
          { lastLogin: new Date() },
          { new: true }
        );
      }
      
      return true;
    },
      async session({ session, token }: { session: {user: {id?: string, name?: string, email?: string, image?: string}}; token: {userId?: string, name?: string, email?: string, picture?: string} }) {
      if (token && session?.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
      async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.name = user.name;
            token.email = user.email;
            token.picture = user.image;
        }
        return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
