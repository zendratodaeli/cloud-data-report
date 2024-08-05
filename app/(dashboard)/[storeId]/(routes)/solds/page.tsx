import prismadb from '@/lib/prismadb';
import { SoldColumn } from './components/columns';
import { format } from 'date-fns';
import { auth } from '@clerk/nextjs/server';
import { formatter } from '@/lib/utils';
import SoldClient from './components/client';

const SoldPage = async ({ params }: { params: { storeId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const soldRecords = await prismadb.sold.findMany({
    where: {
      product: {
        storeId: params.storeId,
        store: {
          userId: userId,
        },
      },
    },
    include: {
      product: true,
      category: true
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedSoldRecords: SoldColumn[] = soldRecords.map((record) => ({
    id: record.id,
    productName: record.product.name,
    totalSoldOut: record.totalSoldOut,
    income: formatter.format(record.income),
    netProfit: formatter.format(record.netProfit), // Include netProfit in formatted records
    category: record.category.name,
    createdAt: format(new Date(record.createdAt), 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col pt-16">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SoldClient data={formattedSoldRecords} />
      </div>
    </div>
  );
};

export default SoldPage;
