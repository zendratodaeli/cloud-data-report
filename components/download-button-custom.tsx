"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { File, Option } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "./ui/button";

const DownloadButtonCustom = () => {
  const params = useParams();

  const handleFileCategoryDownload = () => {
    const link = document.createElement("a");
    link.href = "/cloud-data-report-category-template.xlsx";
    link.download = "cloud-data-report-category-template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSoldDownload = () => {
    const link = document.createElement("a");
    link.href = "/cloud-data-report-sold-template.xlsx";
    link.download = "cloud-data-report-sold-template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentPath = window.location.pathname;
  const soldsPath = `/${params.storeId}/solds`;
  const categoryPath = `/${params.storeId}/categories`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center flex-1">
          <Option className="h-5 w-5 mr-3" />
          <Button variant={"outline"}>Download Options</Button>
        </div>
      </DropdownMenuTrigger>

      {currentPath === categoryPath && (
        <DropdownMenuContent>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button
              className="w-full"
              onClick={handleFileCategoryDownload}
              variant={"outline"}
            >
              <File className="mr-2 h-4 w-4" />
              Download Category Template
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}

      {currentPath === soldsPath && (
        <DropdownMenuContent>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button
              className="w-full"
              onClick={handleFileSoldDownload}
              variant={"outline"}
            >
              <File className="mr-2 h-4 w-4" />
              Download Sold Template
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default DownloadButtonCustom;
