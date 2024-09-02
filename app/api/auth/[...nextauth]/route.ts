import { userOptions } from '@/lib/auth';
import NextAuth from 'next-auth';
const handler = NextAuth(userOptions);
export { handler as GET, handler as POST };
