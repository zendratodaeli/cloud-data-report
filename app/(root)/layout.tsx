import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const SetupLayout = async ({
  children
} : {
  children: React.ReactNode
}) => {
  
  const { userId } = auth();

  const adminId = "user_2jycpXmZTQ0FxmZiV0uFBjzXRFn";

  if(!userId) {
    redirect("/sign-in");
  }

  if(userId === adminId) {
    redirect("/admin");
  }

  console.log(userId)

  const store = await prismadb.store.findFirst({
    where: {
      userId: userId
    }
  });

  if(store) {
    redirect(`/${store.id}`);
  }

  return (
    <>
      {children}
    </>
  );
}

export default SetupLayout;
