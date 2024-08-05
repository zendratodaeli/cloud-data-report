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
        sold: true,
      },
    });

    return NextResponse.json(product)
  } catch (error) {
    console.log("[product_get]", error)
    return new NextResponse("Internal Error", { status: 500})
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string, productId: string } }) {
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

    if (!capital) {
      return new NextResponse("Capital is required", { status: 400 });
    }

    if (!quantity) {
      return new NextResponse("Quantity is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category Id is required", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Product Id is required", { status: 400 });
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

    const existingProduct = await prismadb.product.findUnique({
      where: { id: params.productId },
      include: { sold: true },
    });

    if (!existingProduct) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const totalSold = existingProduct.sold.reduce((acc, sold) => acc + sold.totalSoldOut, 0);
    const remainQuantity = quantity - totalSold;
    const income = totalSold * pricePerPiece;
    const profit = income - capital - (income * (tax || existingProduct.tax) / 100);

    const product = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        pricePerPiece,
        capital,
        quantity,
        remainQuantity,
        income,
        tax: tax || existingProduct.tax,
        profit,
        categoryId,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[product_patch]", error);
    return new NextResponse("Internal Error", { status: 500 });
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