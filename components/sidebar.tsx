"use client";

import { Montserrat } from "next/font/google";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  FileInput,
  FileType,
  LayoutDashboardIcon,
  Notebook,
  Settings,
  User,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Separator } from "./ui/separator";
import StoreName from "./store-name";
import { useUser } from "@clerk/nextjs";

const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

const SideBar = () => {
  const pathname = usePathname();
  const params = useParams();

  const { user } = useUser();
  const userId = user?.id;

  const listAdminId = [{ adminId1: "user_2jycpXmZTQ0FxmZiV0uFBjzXRFn" }];

  if (!userId) {
    return null;
  }

  const isAdmin = listAdminId.some((admin) =>
    Object.values(admin).includes(userId)
  );

  const routes = [];

  if (userId && !isAdmin) {
    routes.push(
      {
        label: "Categories",
        icon: FileType,
        color: " text-black",
        href: `/${params.storeId}/categories`,
      },
      {
        label: "Products",
        icon: Notebook,
        color: " text-black",
        href: `/${params.storeId}/products`,
      },
      {
        label: "Solds",
        icon: FileInput,
        color: " text-black",
        href: `/${params.storeId}/solds`,
      },
      {
        href: `/${params.storeId}/settings`,
        label: "Settings",
        icon: Settings,
        color: " text-black",
      }
    );
  }

  if (userId && isAdmin) {
    routes.push(
      {
        label: "Admin",
        icon: LayoutDashboardIcon,
        color: " text-black",
        href: `/admin`,
      },
      {
        label: "Users",
        icon: User,
        color: " text-black",
        href: `/admin/users`,
      }
    );
  }

  const cDr = (
    <p className="text-xl font-bold text-black dark:text-white cursor-pointer">
      Cloud Data Report
    </p>
  );

  return (
    <div className="space-y-4 py-4 flex flex-col h-full from-purple-50 to-white bg-slate-50 border shadow-lg text-black overflow-y-auto">
      <div className=" py-2 flex-1">
        <div className="pl-3 mb-4">
          {isAdmin ? cDr : <StoreName storeId={`${params.storeId}`} />}
        </div>
        <Separator />
        <div className="space-y-1 p-5">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-black hover:bg-slate-200 hover:rounded-sm rounded-leg transition",
                pathname === route.href
                  ? "text-black bg-slate-300 rounded-md"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
