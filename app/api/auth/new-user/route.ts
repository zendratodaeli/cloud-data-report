import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prismadb';
import { parseISO, isValid } from 'date-fns';

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const user = await currentUser();

  if (!user) {
    return new NextResponse('User not exist', { status: 404 });
  }

  const listAdminId = [{ adminId1: "user_2jycpXmZTQ0FxmZiV0uFBjzXRFn" }];

  const isAdmin = listAdminId.some((admin) =>
    Object.values(admin).includes(userId)
  );

  const userMetadata = user.publicMetadata as {
    store?: string;
    owner?: string;
    address?: string;
    phoneNumber?: string;
  };

  const convertToDate = (date: string | number | Date | null | undefined): Date => {
    if (!date) return new Date();
    if (typeof date === 'string') {
      const parsedDate = parseISO(date);
      return isValid(parsedDate) ? parsedDate : new Date();
    }
    return new Date(date);
  };

  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser && !isAdmin) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        name: user.fullName ?? '',
        image: user.imageUrl ?? '',
        email: user.emailAddresses[0].emailAddress ?? '',
        store: userMetadata.store ?? '',
        owner: userMetadata.owner ?? '',
        address: userMetadata.address ?? '',
        phoneNumber: userMetadata.phoneNumber ?? '',
        lastActive: convertToDate(user.lastActiveAt),
        lastSignIn: convertToDate(user.lastSignInAt),
      },
    });
  }

  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: '/',
    },
  });
}
