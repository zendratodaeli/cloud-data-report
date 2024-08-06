import React from "react";
import MobileSidebar from "@/components/mobile-sidebar";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Montserrat } from "next/font/google";
import { Button } from "./ui/button";
import StoreName from "./store-name";
import { auth } from "@clerk/nextjs/server";

const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

interface NavbarProps {
  storeId: string
}

const NavBar = async ({storeId}: NavbarProps) => {

  const { userId } = auth();

  const listAdminId = [{ adminId1: "user_2jycpXmZTQ0FxmZiV0uFBjzXRFn" }];

  if (!userId) {
    return null;
  }

  const isAdmin = listAdminId.some((admin) =>
    Object.values(admin).includes(userId)
  );

  const cDr = (
    <h1 className="text-xl font-bold dark:text-white">Cloud Data Report</h1>
  );

  return (
    <div className="flex items-center p-3 border-b z-50 fixed w-full from-purple-50 to-white shadow-md bg-slate-50">
      <MobileSidebar />
      <div className="hidden md:flex w-full pl-5">
       {isAdmin ? cDr : <StoreName storeId={storeId}/>} 
      </div>
      <div className="flex w-full justify-end pr-5">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <Button variant={"outline"}>
            <SignOutButton />
          </Button>
        </SignedIn>
      </div>
    </div>
  );
};

export default NavBar;
