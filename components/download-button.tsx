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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product, Store } from "@prisma/client";

interface DownloadButtonProps {
  data: ProductColumn[];
  chartRef: React.RefObject<HTMLDivElement>;
  store: Store
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data, chartRef, store }) => {
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
    const worksheet = workbook.addWorksheet(`Products ${store.name}`);

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
    saveAs(blob, `${store.name}.xlsx`);
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
          <title>Products Data of ${store.name}</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1rem;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f2f2f2;
            }
            h1{
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>${store.name}</h1>
          ${
            chartImage
              ? `<img src="${chartImage}" style="width:100%; height:auto;"/>`
              : ""
          }
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
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center flex-1">
          <Option className="h-5 w-5 mr-3" />
          <Button variant={"outline"}>Download Options</Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            onClick={onExportLocal}
            variant={"outline"}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download as Excel
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button onClick={onPrint} variant={"outline"} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadButton;
