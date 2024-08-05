import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { productId, totalSoldOut, createdAt } = body;

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

    const newIncome = totalSoldOut * product.pricePerPiece;
    const totalSold = product.sold.reduce((acc, sold) => acc + sold.totalSoldOut, 0) + totalSoldOut;
    const remainQuantity = product.quantity - totalSold;
    const grossIncome = totalSold * product.pricePerPiece;
    const grossProfit = grossIncome - product.capital;
    const netIncome = grossIncome - (grossIncome * (product.tax / 100));
    const profit = netIncome - product.capital;

    const previousSoldRecords = await prismadb.sold.findMany({
      where: {
        productId: productId,
        createdAt: {
          lt: createdAt ? new Date(createdAt) : new Date(),
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const cumulativeSoldOut = previousSoldRecords.reduce((acc, record) => acc + record.totalSoldOut, 0);
    const netProfit = (totalSoldOut + cumulativeSoldOut) * product.pricePerPiece - ((totalSoldOut + cumulativeSoldOut) * product.pricePerPiece * (product.tax / 100)) - product.capital;

    const newSoldRecord = await prismadb.sold.create({
      data: {
        productId,
        totalSoldOut,
        income: newIncome,
        netProfit: netProfit,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      },
    });

    await prismadb.product.update({
      where: { id: productId },
      data: {
        remainQuantity,
        grossIncome,
        income: netIncome,
        grossProfit,
        profit,
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
            sold: {
              include: {
                product: true,  // Ensure we include the product details
              },
            },
          },
        },
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const soldRecords = storeByUserId.products.flatMap(product => product.sold);

    // Define the type for the cumulative net profit accumulator
    type CumulativeNetProfit = {
      [date: string]: number;
    };

    // Calculate cumulative net profit
    const cumulativeNetProfit: CumulativeNetProfit = {};
    let cumulativeSoldOut = 0;

    soldRecords.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    soldRecords.forEach(record => {
      const date = new Date(record.createdAt).toISOString().split('T')[0];
      cumulativeSoldOut += record.totalSoldOut;
      const netProfit = cumulativeSoldOut * record.product.pricePerPiece - (cumulativeSoldOut * record.product.pricePerPiece * (record.product.tax / 100)) - record.product.capital;
      cumulativeNetProfit[date] = netProfit;
    });

    return NextResponse.json({ soldRecords, cumulativeNetProfit });

  } catch (error) {
    console.log("[solds_get]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
