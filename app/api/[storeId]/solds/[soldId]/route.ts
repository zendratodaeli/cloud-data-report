import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function calculateCumulativeNetProfit(productId: string) {
  const product = await prismadb.product.findUnique({
    where: { id: productId },
    include: { sold: true },
  });

  let cumulativeSoldOut = 0;
  let cumulativeNetProfit = 0;

  if (!product) {
    return null;
  }

  product.sold.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  product.sold.forEach(record => {
    cumulativeSoldOut += record.totalSoldOut;
    const netProfit = cumulativeSoldOut * product.pricePerPiece - (cumulativeSoldOut * product.pricePerPiece * (product.tax / 100)) - product.capital;
    record.netProfit = netProfit;
    cumulativeNetProfit += netProfit;
  });

  await prismadb.sold.updateMany({
    where: { productId: productId },
    data: { netProfit: cumulativeNetProfit },
  });

  return cumulativeNetProfit;
}

export async function GET(req: Request, { params }: { params: { soldId: string } }) {
  try {
    if (!params.soldId) {
      return new NextResponse("Sold Id is required", { status: 400 });
    }

    const soldRecord = await prismadb.sold.findUnique({
      where: {
        id: params.soldId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!soldRecord) {
      return new NextResponse("Sold record not found", { status: 404 });
    }

    return NextResponse.json(soldRecord);

  } catch (error) {
    console.log("[sold_get]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string, soldId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { productId, totalSoldOut, categoryId, createdAt } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category Id is required", { status: 400 });
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

    const soldRecord = await prismadb.sold.findUnique({
      where: { id: params.soldId },
    });

    if (!soldRecord) {
      return new NextResponse("Sold record not found", { status: 404 });
    }

    const product = await prismadb.product.findUnique({
      where: { id: productId },
      include: { sold: true },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Check for duplicate entry excluding the current record
    const duplicateCheck = await prismadb.sold.findFirst({
      where: {
        productId,
        categoryId,
        createdAt: new Date(createdAt),
        NOT: {
          id: params.soldId,
        },
      },
    });

    if (duplicateCheck) {
      return new NextResponse("A record already exists for the selected product, category, and date.", { status: 400 });
    }


    const updatedSoldRecord = await prismadb.sold.update({
      where: { id: params.soldId },
      data: {
        totalSoldOut,
        income: totalSoldOut * product.pricePerPiece,
        categoryId,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      },
    });

    await calculateCumulativeNetProfit(productId);

    const totalSold = product.sold.reduce((acc, sold) => acc + (sold.id === soldRecord.id ? totalSoldOut : sold.totalSoldOut), 0);
    const remainQuantity = product.quantity - totalSold;
    const grossIncome = totalSold * product.pricePerPiece;
    const netIncome = grossIncome - (grossIncome * (product.tax / 100));
    const profit = netIncome - product.capital;

    await prismadb.product.update({
      where: { id: productId },
      data: {
        remainQuantity,
        grossIncome,
        income: netIncome,
        profit,
      },
    });

    return NextResponse.json(updatedSoldRecord);

  } catch (error) {
    console.log("[sold_patch]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string, soldId: string } }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
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

    const soldRecord = await prismadb.sold.findUnique({
      where: { id: params.soldId },
    });

    if (!soldRecord) {
      return new NextResponse("Sold record not found", { status: 404 });
    }

    const product = await prismadb.product.findUnique({
      where: { id: soldRecord.productId },
      include: { sold: true },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    await prismadb.sold.delete({
      where: { id: params.soldId },
    });

    // Recalculate product financial details after deletion
    const remainingSoldRecords = await prismadb.sold.findMany({
      where: { productId: product.id },
    });

    const totalSold = remainingSoldRecords.reduce((acc, sold) => acc + sold.totalSoldOut, 0);
    const grossIncome = totalSold * product.pricePerPiece;
    const netIncome = grossIncome - (grossIncome * (product.tax / 100));
    const profit = netIncome;
    const grossProfit = grossIncome;


    const updateProduct = await prismadb.product.update({
      where: { id: product.id },
      data: {
        remainQuantity: product.quantity - totalSold,
        grossIncome,
        income: netIncome,
        profit,
        grossProfit
      },
    });

    console.log(updateProduct)
    return new NextResponse("Sold record deleted successfully");

  } catch (error) {
    console.log("[sold_delete]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
