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
import Link from "next/link";
import { Button } from "./ui/button";
import StoreName from "./store-name";

const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin"],
});



const NavbarAdmin = async () => {
  return (
    <div className="flex items-center p-3 border-b z-50 fixed w-full from-purple-50 to-white shadow-md bg-slate-50">
      <div className="w-full">
        <h1 className="text-xl font-bold">Cloud Data Report</h1>
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

export default NavbarAdmin;
