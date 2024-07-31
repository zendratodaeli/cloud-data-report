"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Option, Printer } from "lucide-react";
import { ProductColumn } from "@/app/(dashboard)/[storeId]/(routes)/products/components/columns";
import jsPDF from "jspdf";
import "jspdf-autotable";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface DownloadButtonProps {
  data: ProductColumn[];
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onExportLocal = () => {
    const fileName = "Products_Data.xlsx";

    const headers = [
      "Number",
      "Store",
      "Name",
      "Price",
      "Category",
      "Status",
      "Created At",
    ];

    const formattedData = data.map((eachData, index) => ({
      Number: index + 1,
      Store: eachData.storeName,
      Name: eachData.name,
      Price: eachData.price,
      Category: eachData.category,
      Status: eachData.isSold,
      "Created At": eachData.createdAt,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };

    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const onExportPDF = () => {
    const doc = new jsPDF();
    const headers = [
      ["Number", "Store", "Name", "Price", "Category", "Status", "Created At"],
    ];

    const formattedData = data.map((eachData, index) => [
      index + 1,
      eachData.storeName,
      eachData.name,
      eachData.price,
      eachData.category,
      eachData.isSold,
      eachData.createdAt,
    ]);

    (doc as any).autoTable({
      head: headers,
      body: formattedData,
    });

    doc.save("Products_Data.pdf");
  };

  const onPrint = () => {
    const printWindow = window.open("", "_blank");
    const headers = [
      "Number",
      "Store",
      "Name",
      "Price",
      "Category",
      "Status",
      "Created At",
    ];

    const formattedData = data
      .map(
        (eachData, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${eachData.storeName}</td>
        <td>${eachData.name}</td>
        <td>${eachData.price}</td>
        <td>${eachData.category}</td>
        <td>${eachData.isSold}</td>
        <td>${eachData.createdAt}</td>
      </tr>
    `
      )
      .join("");

    const printContent = `
      <html>
        <head>
          <title>Products Data</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h1>Products Data</h1>
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${formattedData}
            </tbody>
          </table>
        </body>
      </html>
    `;

    if (!printWindow) {
      return null;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Drawer>
      <DrawerTrigger>
        <div className="flex items-center flex-1">
          <Option className="h-5 w-5 mr-3" />
          <Button variant={"outline"}>
            Download Options
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="h-1/2 lg:h-1/3">
        <DrawerHeader>
          <DrawerTitle className="text-center mb-5">
            Choose one of the options
          </DrawerTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 space-y-4 lg:space-y-0 lg:space-x-10">
            <div>
              <Button
                onClick={onExportLocal}
                variant={"outline"}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download as Excel
              </Button>
            </div>
            <div>
              <Button
                onClick={onExportPDF}
                variant={"outline"}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download as PDF
              </Button>
            </div>
            <div>
              <Button onClick={onPrint} variant={"outline"} className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>
            <Button variant="default">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DownloadButton;
