"use client";

import { Button } from "@/components/ui/button";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import SideBar from "./sidebar";


const MobileSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (user) {
    return (
      <Sheet>
        <SheetTrigger>
          <Button variant="ghost" size="icon">
            <Menu/>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SideBar/>
        </SheetContent>
      </Sheet>
    );
  }
};

export default MobileSidebar;
