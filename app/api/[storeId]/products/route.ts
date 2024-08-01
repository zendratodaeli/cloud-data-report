import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: {storeId: string}}) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { 
      name, 
      price, 
      categoryId,
      isSold = false,
      createdAt
    } = body;

    if(!userId) {
      return new NextResponse("Unauthenticated", {status: 401})
    };

    if(!name) {
      return new NextResponse("Name is required", {status: 400})
    };

    if(!price) {
      return new NextResponse("Price is required", {status: 400})
    };

    if(!categoryId) {
      return new NextResponse("Category Id is required", {status: 400})
    };

    if(!params.storeId) {
      return new NextResponse("StoreId is required", {status: 400})
    }

    
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    })
    
    if(!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403})
    }

    const product = await prismadb.product.create({
      data: {
        name, 
        price, 
        categoryId, 
        isSold,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        storeId: params.storeId,
    }
    });

    return NextResponse.json(product);

  } catch (error) {
    console.log("[products_post]", error)
    return new NextResponse("Internal error", {status: 500})
  }
}

export async function GET(req: Request, { params }: { params: {storeId: string}}) {
  try {

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const isSold = searchParams.get("isSold");


    if(!params.storeId) {
      return new NextResponse("StoreId is required", {status: 400})
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        isSold: false
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);

  } catch (error) {
    console.log("[products_get]", error)
    return new NextResponse("Internal error", {status: 500})
  }
}