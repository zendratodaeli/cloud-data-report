import { format } from "date-fns";
import prisma from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import DataClient from "./components/client";
import { redirect } from "next/navigation";
import { UserColumn } from "./components/columns";

const UsersPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return (
      <div className="p-8 pt-6">
        <p className="text-center">You must be logged in!</p>
      </div>
    );
  }

  const listAdminId = [{ adminId1: "user_2jycpXmZTQ0FxmZiV0uFBjzXRFn" }];

  const isAdmin = listAdminId.some((admin) =>
    Object.values(admin).includes(userId)
  );

  if (!isAdmin) {
    redirect("/");
    return null;
  }

  const users = await prisma.user.findMany();

  const formattedUsers: UserColumn[] = users.map((user) => ({
    userId: user.id,
    store: user.store ?? "No Store",
    name: user.name ?? "No Name",
    imageUrl: user.image ?? "/default-image.jpg",
    email: user.email ?? "No Email",
    owner: user.owner ?? "No Owner",
    address: user.address ?? "No Address",
    phoneNumber: user.phoneNumber ?? "No phone number",
    lastActive: format(user.lastActive, "MMMM do, yyyy"),
    lastSignIn: format(user.lastSignIn, "MMMM do, yyyy"),
    createdAt: format(user.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-20">
      <DataClient data={formattedUsers} />
    </div>
  );
};

export default UsersPage;
