import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: {storeId: string}}) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;

    if(!userId) {
      return new NextResponse("Unauthenticated", {status: 401})
    };

    if(!name) {
      return new NextResponse("Name is required", {status: 400})
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

    const categories = await prismadb.category.create({
      data: {
        name, storeId: params.storeId
      }
    })

    return NextResponse.json(categories);

  } catch (error) {
    console.log("[categories_post]", error)
    return new NextResponse("Internal error", {status: 500})
  }
}


export async function GET(req: Request, { params }: { params: {storeId: string}}) {
  try {

    if(!params.storeId) {
      return new NextResponse("StoreId is required", {status: 400})
    }

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId
      }
    });

    return NextResponse.json(categories);

  } catch (error) {
    console.log("[categories_get]", error)
    return new NextResponse("Internal error", {status: 500})
  }
}