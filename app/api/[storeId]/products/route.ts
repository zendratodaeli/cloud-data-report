import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      pricePerPiece,
      capital,
      quantity,
      categoryId,
      tax,
      createdAt
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!pricePerPiece) {
      return new NextResponse("Price per piece is required", { status: 400 });
    }

    if (!tax) {
      return new NextResponse("Tax is required", { status: 400 });
    }

    if (!capital) {
      return new NextResponse("Capital is required", { status: 400 });
    }

    if (!quantity) {
      return new NextResponse("Quantity is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category Id is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
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
    
    const initialCapital = 0 - capital

    const product = await prismadb.product.create({
      data: {
        name,
        pricePerPiece,
        capital,
        quantity,
        remainQuantity: quantity,
        income: 0,
        grossIncome: 0,
        tax: tax || 0,
        grossProfit: initialCapital,
        profit: initialCapital,
        soldOutQuantity: 0,
        categoryId,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        storeId: params.storeId,
      }
    });

    return NextResponse.json(product);

  } catch (error) {
    console.log("[products_post]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;

    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
      },
      include: {
        category: true,
        sold: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const productsWithSoldOutQuantity = products.map(product => {
      const soldOutQuantity = product.sold.reduce((total, sold) => total + sold.totalSoldOut, 0);
      return {
        ...product,
        soldOutQuantity,
      };
    });

    return NextResponse.json(productsWithSoldOutQuantity);

  } catch (error) {
    console.log("[products_get]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
