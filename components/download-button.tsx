"use client";

import { useEffect, useState } from "react";
import { Download, Option, Printer } from "lucide-react";
import { ProductColumn } from "@/types";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface DownloadButtonProps {
  data: ProductColumn[];
  chartRef: React.RefObject<HTMLDivElement>;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data, chartRef }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const captureChart = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current, { useCORS: true });
      return canvas.toDataURL("image/png");
    }
    return null;
  };

  const onExportLocal = async () => {
    const chartImage = await captureChart();
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Products Data");

    worksheet.columns = [
      { header: "Number", key: "number", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Price Per Piece", key: "pricePerPiece", width: 15 },
      { header: "Capital", key: "capital", width: 15 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Remain Quantity", key: "remainQuantity", width: 15 },
      { header: "Sold Out Quantity", key: "soldOutQuantity", width: 15 },
      { header: "Gross Income", key: "grossIncome", width: 15 },
      { header: "Gross Profit", key: "grossProfit", width: 15 },
      { header: "Income", key: "income", width: 15 },
      { header: "Tax", key: "tax", width: 10 },
      { header: "Profit", key: "profit", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    data.forEach((eachData, index) => {
      worksheet.addRow({
        number: index + 1,
        name: eachData.name,
        pricePerPiece: eachData.pricePerPiece,
        capital: eachData.capital,
        quantity: eachData.quantity,
        remainQuantity: eachData.remainQuantity,
        soldOutQuantity: eachData.soldOutQuantity,
        grossIncome: eachData.grossIncome,
        grossProfit: eachData.grossProfit,
        income: eachData.income,
        tax: eachData.tax,
        profit: eachData.profit,
        category: eachData.category,
        createdAt: eachData.createdAt,
      });
    });

    if (chartImage) {
      const imageId = workbook.addImage({
        base64: chartImage,
        extension: "png",
      });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: data.length + 2 },
        ext: { width: 500, height: 300 },
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "Products_Data.xlsx");
  };

  const onExportPDF = async () => {
    const doc = new jsPDF();
    const chartImage = await captureChart();

    if (chartImage) {
      doc.addImage(chartImage, "PNG", 10, 10, 180, 80);
    }

    const headers = [
      ["Number", "Name", "Price Per Piece", "Capital", "Quantity", "Remain Quantity", "Sold Out Quantity", "Gross Income", "Gross Profit", "Income", "Tax", "Profit", "Category", "Created At"],
    ];

    const formattedData = data.map((eachData, index) => [
      index + 1,
      eachData.name,
      eachData.pricePerPiece,
      eachData.capital,
      eachData.quantity,
      eachData.remainQuantity,
      eachData.soldOutQuantity,
      eachData.grossIncome,
      eachData.grossProfit,
      eachData.income,
      eachData.tax,
      eachData.profit,
      eachData.category,
      eachData.createdAt,
    ]);

    (doc as any).autoTable({
      startY: chartImage ? 100 : 20,
      head: headers,
      body: formattedData,
    });

    doc.save("Products_Data.pdf");
  };

  const onPrint = async () => {
    const chartImage = await captureChart();
    const printWindow = window.open("", "_blank");

    const headers = [
      "Number",
      "Name",
      "Price Per Piece",
      "Capital",
      "Quantity",
      "Remain Quantity",
      "Sold Out Quantity",
      "Gross Income",
      "Gross Profit",
      "Income",
      "Tax",
      "Profit",
      "Category",
      "Created At",
    ];

    const formattedData = data
      .map(
        (eachData, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${eachData.name}</td>
        <td>${eachData.pricePerPiece}</td>
        <td>${eachData.capital}</td>
        <td>${eachData.quantity}</td>
        <td>${eachData.remainQuantity}</td>
        <td>${eachData.soldOutQuantity}</td>
        <td>${eachData.grossIncome}</td>
        <td>${eachData.grossProfit}</td>
        <td>${eachData.income}</td>
        <td>${eachData.tax}</td>
        <td>${eachData.profit}</td>
        <td>${eachData.category}</td>
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
          ${chartImage ? `<img src="${chartImage}" style="width:100%; height:auto;"/>` : ""}
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
