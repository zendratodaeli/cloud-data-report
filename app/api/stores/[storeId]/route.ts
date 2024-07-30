import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: {params: {storeId: string}}
) {
  try {

    if(!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400});
    };

    const store = await prismadb.store.findUnique({
      where: {
        id: params.storeId
      },
    });

    return NextResponse.json(store)
  } catch (error) {
    console.log("[category_get]", error)
    return new NextResponse("Internal Error", { status: 500})
  }
}


export async function PATCH(req: Request, { params }: {params: {storeId: string}}
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;
    if(!userId) {
      return new NextResponse("Unauthenticated", { status: 401});
    };

    if(!name) {
      return new NextResponse("Name is required", { status: 400});
    };

    if(!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400});
    };

    const store = await prismadb.store.updateMany({
      where: {
        id: params.storeId,
        userId: userId
      },
      data: {
        name
      }
    });

    return NextResponse.json(store)
    
  } catch (error) {
    console.log("[store_patch]", error)
    return new NextResponse("Internal Error", { status: 500})
  }
}


export async function DELETE(req: Request, { params }: {params: {storeId: string}}
) {
  try {
    const { userId } = auth();

    if(!userId) {
      return new NextResponse("Unauthenticated", { status: 401});
    };

    if(!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400});
    };

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId: userId
      },
    });

    return NextResponse.json(store)
  } catch (error) {
    console.log("[store_delete]", error)
    return new NextResponse("Internal Error", { status: 500})
  }
}

