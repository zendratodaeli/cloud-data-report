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

    // Validate and process the array of product data
    const products = body.map((product: any) => ({
      storeId: params.storeId,
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      isSold: product.isSold,
    }));

    const product = await prismadb.product.createMany({
      data: products,
    });

    return NextResponse.json({ message: "Data added successfully", product });
  } catch (error) {
    console.log("[data_post]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
