import { mongoDBConnection } from './mongodb';
import User from '@/models/User';
import type { NextAuthOptions } from 'next-auth';
import credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const userOptions: NextAuthOptions = {
  providers: [
    credentials({
      name: 'Credentials',
      id: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async function (
        credentials: Record<'email' | 'password', string> | undefined
      ) {
        await mongoDBConnection();

        const user = await User.findOne({
          email: credentials?.email,
        }).select('+password');

        if (!user) {
          throw new Error('No user found');
        }

        const passwordMatch = await bcrypt.compare(
          credentials!.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error('Password is wrong');
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.agency = user.agency;
        token.uen = user.uen;
        token.address = user.address;
        token.poc_name = user.poc_name;
        token.poc_phone = user.poc_phone;
        token.halal_certification = user.halal_certification;
        token.hygiene_certification = user.hygiene_certification;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.agency = token.agency;
        session.user.uen = token.uen;
        session.user.address = token.address;
        session.user.poc_name = token.poc_name;
        session.user.poc_phone = token.poc_phone;
        session.user.halal_certification = token.halal_certification;
        session.user.hygiene_certification = token.hygiene_certification;
        session.user.role = token.role;
        session.user.email = token.email;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};
