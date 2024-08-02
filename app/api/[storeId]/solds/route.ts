import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      productId,
      totalSoldOut,
      createdAt
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    if (!totalSoldOut) {
      return new NextResponse("Total sold out is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const product = await prismadb.product.findUnique({
      where: { id: productId },
      include: { sold: true },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const newSoldRecord = await prismadb.sold.create({
      data: {
        productId,
        totalSoldOut,
        income: totalSoldOut * product.pricePerPiece,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      },
    });

    const totalSold = product.sold.reduce((acc, sold) => acc + sold.totalSoldOut, 0) + totalSoldOut;
    const remainQuantity = product.quantity - totalSold;
    const grossIncome = totalSold * product.pricePerPiece;
    const netIncome = grossIncome - (grossIncome * (product.tax / 100)); // Calculate net income after tax
    const profit = netIncome - product.capital;

    await prismadb.product.update({
      where: { id: productId },
      data: {
        remainQuantity,
        grossIncome, // Store gross income
        income: netIncome, // Store net income
        profit,
        // Do not update the tax here as it is static
      },
    });

    return NextResponse.json(newSoldRecord);

  } catch (error) {
    console.log("[sold_post]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
      },
      include: {
        products: {
          include: {
            sold: true,
          },
        },
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const soldRecords = storeByUserId.products.flatMap(product => product.sold);

    return NextResponse.json(soldRecords);

  } catch (error) {
    console.log("[solds_get]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
