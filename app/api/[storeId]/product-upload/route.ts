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
      storeId: params.storeId,
      name: product.name,
      categoryId: product.categoryId,
      pricePerPiece: parseFloat(product.pricePerPiece.replace(/[^0-9.-]+/g, "")),
      capital: parseFloat(product.capital.replace(/[^0-9.-]+/g, "")),
      quantity: parseInt(product.quantity, 0),
      remainQuantity: parseInt(product.quantity, 0),
      income: 0,
      grossIncome: 0,
      tax: parseFloat(product.tax.replace(/[^0-9.-]+/g, "")) || 0,
      profit: 0,
      grossProfit: 0,
      soldOutQuantity: 0,
      createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
    }));

    for (const product of products) {
      const duplicateCheck = await prismadb.product.findFirst({
        where: {
          name: product.name,
          categoryId: product.categoryId,
          createdAt: product.createdAt,
          storeId: params.storeId,
        },
      });

      if (duplicateCheck) {
        return new NextResponse(`A product with the name "${product.name}", category, and date already exists.`, { status: 400 });
      }
    }
    const product = await prismadb.product.createMany({
      data: products,
    });

    return NextResponse.json({ message: "Product added successfully", product });
  } catch (error) {
    console.log("[data_post]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
