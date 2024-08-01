import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


export async function GET(req: Request, { params }: {params: {productId: string}}
) {
  try {

    if(!params.productId) {
      return new NextResponse("Product Id is required", { status: 400});
    };

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product)
  } catch (error) {
    console.log("[product_get]", error)
    return new NextResponse("Internal Error", { status: 500})
  }
}

export async function PATCH(req: Request, { params }: {params: {storeId: string, productId: string}}
) {
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
      return new NextResponse("Unauthenticated", { status: 401});
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


    if(!createdAt) {
      return new NextResponse("Created at is required", {status: 400})
    };

    if(!params.productId) {
      return new NextResponse("Product Id is required", { status: 400});
    };

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    })

    if(!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403})
    }

    const product = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name, 
        price, 
        categoryId,
        isSold,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
    }
    });

    return NextResponse.json(product)
  } catch (error) {
    console.log("[product_patch]", error)
    return new NextResponse("Internal Error", { status: 500})
  }
}

export async function DELETE(req: Request, { params }: {params: {storeId: string, productId: string}}
) {
  try {
    const { userId } = auth();

    if(!userId) {
      return new NextResponse("Unauthenticated", { status: 401});
    };

    if(!params.productId) {
      return new NextResponse("Product Id is required", { status: 400});
    };

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    })

    if(!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403})
    }

    const product = await prismadb.product.deleteMany({
      where: {
        id: params.productId
      },
    });

    return NextResponse.json(product)
  } catch (error) {
    console.log("[product_delete]", error)
    return new NextResponse("Internal Error", { status: 500})
  }
}