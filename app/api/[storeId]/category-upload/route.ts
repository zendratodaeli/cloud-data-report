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
    

    const cateogories = body.map((category: any) => ({
      storeId: params.storeId,
      name: category.name,
      createdAt: category.createdAt ? new Date(category.createdAt) : new Date(),
    }));

    for (const category of cateogories) {
      const duplicateCheck = await prismadb.category.findFirst({
        where: {
          name: category.name,
          storeId: params.storeId,
        },
      });

      if (duplicateCheck) {
        return new NextResponse(`A product with the name "${category.name}", category, and date already exists.`, { status: 400 });
      }
    }
    const product = await prismadb.category.createMany({
      data: cateogories,
    });

    return NextResponse.json({ message: "Category added successfully", product });
  } catch (error) {
    console.log("[data_post]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}