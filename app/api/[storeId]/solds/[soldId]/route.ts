import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

    const updatedSoldRecord = await prismadb.sold.update({
      where: { id: params.soldId },
      data: {
        totalSoldOut,
        income: totalSoldOut * product.pricePerPiece,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      },
    });

    const totalSold = product.sold.reduce((acc, sold) => acc + (sold.id === soldRecord.id ? totalSoldOut : sold.totalSoldOut), 0);
    const remainQuantity = product.quantity - totalSold;
    const income = totalSold * product.pricePerPiece;
    const tax = income * 0.1;
    const profit = income - product.capital;

    await prismadb.product.update({
      where: { id: productId },
      data: {
        remainQuantity,
        income,
        tax,
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

    const totalSold = product.sold.reduce((acc, sold) => acc + (sold.id !== soldRecord.id ? sold.totalSoldOut : 0), 0);
    const remainQuantity = product.quantity - totalSold;
    const income = totalSold * product.pricePerPiece;
    const tax = income * 0.1;
    const profit = income - product.capital;

    await prismadb.product.update({
      where: { id: soldRecord.productId },
      data: {
        remainQuantity,
        income,
        tax,
        profit,
      },
    });

    return new NextResponse("Sold record deleted successfully");

  } catch (error) {
    console.log("[sold_delete]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
