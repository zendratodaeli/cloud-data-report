import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const soldItems = body.map((item: any) => {
      // Validate and parse input data
      const totalSoldOut = parseInt(item.totalSoldOut, 10);
      const income = item.income ? parseFloat(item.income.replace(/[^0-9.-]+/g, "")) : 0;
      const netProfit = item.netProfit ? parseFloat(item.netProfit.replace(/[^0-9.-]+/g, "")) : 0;
      const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();

      if (isNaN(totalSoldOut) || isNaN(income) || isNaN(netProfit)) {
        throw new Error("Invalid data in uploaded file");
      }

      return {
        productId: item.productId,
        categoryId: item.categoryId,
        totalSoldOut,
        income,
        netProfit,
        createdAt,
      };
    });

    for (const item of soldItems) {
      const product = await prismadb.product.findUnique({
        where: { id: item.productId },
        include: { sold: true },
      });

      if (!product) {
        return new NextResponse(`Product not found for ID ${item.productId}`, { status: 404 });
      }

      // Check for duplicate entry
      const duplicateCheck = await prismadb.sold.findFirst({
        where: {
          productId: item.productId,
          categoryId: item.categoryId,
          createdAt: item.createdAt,
        },
      });

      if (duplicateCheck) {
        continue; // Skip duplicate entries
      }

      const newIncome = item.totalSoldOut * product.pricePerPiece;
      const totalSold = product.sold.reduce((acc, sold) => acc + sold.totalSoldOut, 0) + item.totalSoldOut;
      const remainQuantity = product.quantity - totalSold;
      const grossIncome = totalSold * product.pricePerPiece;
      const grossProfit = grossIncome - product.capital;
      const netIncome = grossIncome - (grossIncome * (product.tax / 100));
      const profit = netIncome - product.capital;

      const previousSoldRecords = await prismadb.sold.findMany({
        where: {
          productId: item.productId,
          createdAt: {
            lt: item.createdAt,
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const cumulativeSoldOut = previousSoldRecords.reduce((acc, record) => acc + record.totalSoldOut, 0);
      const netProfitCalculated = (item.totalSoldOut + cumulativeSoldOut) * product.pricePerPiece - ((item.totalSoldOut + cumulativeSoldOut) * product.pricePerPiece * (product.tax / 100)) - product.capital;

      await prismadb.sold.create({
        data: {
          productId: item.productId,
          totalSoldOut: item.totalSoldOut,
          income: newIncome,
          netProfit: netProfitCalculated,
          categoryId: item.categoryId,
          createdAt: item.createdAt,
        },
      });

      await prismadb.product.update({
        where: { id: item.productId },
        data: {
          remainQuantity,
          grossIncome,
          income: netIncome,
          grossProfit,
          profit,
        },
      });
    }

    return new NextResponse("Sold record has been added successfully", { status: 200 });
  } catch (error) {
    console.error("[sold_upload]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
