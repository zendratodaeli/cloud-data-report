import NavBar from "@/components/navbar";
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

const SetupLayout = async ({
  children
} : {
  children: React.ReactNode
}) => {  
  const adminId = "user_2jycpXmZTQ0FxmZiV0uFBjzXRFn";
  const { userId } = auth();

  if(!userId) {
    redirect("/sign-in")
  }

  if(userId !== adminId) {
    redirect("/sign-in");
  }

  return (
    <>
      <NavBar storeId={""}/>
      {children}
    </>
  )
}

export default SetupLayout
