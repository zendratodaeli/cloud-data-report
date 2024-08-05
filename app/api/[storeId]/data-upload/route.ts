import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
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

    const products = body.map((product: any) => ({
      name: product.name,
      categoryId: product.categoryId,
      pricePerPiece: parseFloat(product.pricePerPiece.replace(/[^0-9.-]+/g, "")), // Convert to float
      capital: parseFloat(product.capital.replace(/[^0-9.-]+/g, "")), // Convert to float
      quantity: parseInt(product.quantity, 0), // Convert to int
      storeId: params.storeId,
      remainQuantity: parseInt(product.quantity, 0), // Convert to int
      income: 0,
      grossIncome: 0,
      tax: parseFloat(product.tax.replace(/[^0-9.-]+/g, "")) || 0, // Convert to float, default to 0 if not present
      profit: 0 - parseInt(product.capital, 0) * 1000,
      grossProfit: 0 - parseInt(product.capital, 0) * 1000,
      soldOutQuantity: 0,
      createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
    }));

    const product = await prismadb.product.createMany({
      data: products,
    });

    return NextResponse.json({ message: "Data added successfully", product });
  } catch (error) {
    console.log("[data_post]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
