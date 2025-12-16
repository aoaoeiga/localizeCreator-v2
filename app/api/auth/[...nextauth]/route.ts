import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { createServerClient } from '@/lib/supabase';

export const { handlers, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) return false;

      const supabase = createServerClient();

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        await supabase.from('users').insert({
          email: user.email,
          name: user.name || null,
          image: user.image || null,
          subscription_plan: 'free',
        });
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const supabase = createServerClient();

        const { data: dbUser } = await supabase
          .from('users')
          .select('id, subscription_plan')
          .eq('email', session.user.email)
          .single();

        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).subscriptionPlan = dbUser.subscription_plan;
        }
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export const { GET, POST } = handlers;

