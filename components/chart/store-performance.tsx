"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { format, subDays, subMonths, startOfWeek, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { formatter } from "@/lib/utils"; // Ensure the correct path to your formatter utility
import { ChartConfig, ChartContainer } from "../ui/chart";

interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  pricePerPiece: number;
  capital: number;
  quantity: number;
  remainQuantity: number;
  income: number;
  tax: number;
  profit: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
  };
  store: {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  sold: {
    id: string;
    productId: string;
    totalSoldOut: number;
    income: number;
    createdAt: string;
    updatedAt: string;
  }[];
}

interface StorePerformanceProps {
  products: Product[];
}

const chartConfig = {
  soldQuantity: {
    label: "Quantity Sold",
    color: "#00B5AD",
  },
  soldIncome: {
    label: "Income",
    color: "#FF0000",
  },
} satisfies ChartConfig;

const StorePerformance: React.FC<StorePerformanceProps> = ({ products }) => {
  const [timeRange, setTimeRange] = React.useState("7d");
  const [selectedProduct, setSelectedProduct] = React.useState<string>("all");
  const { user } = useUser();
  const userId = user?.id;

  const filteredProducts =
    selectedProduct === "all"
      ? products
      : products.filter((product) => product.name === selectedProduct);

  const now = new Date();
  let pastDate: Date;

  if (timeRange === "7d") {
    pastDate = subDays(now, 6);
  } else if (timeRange === "30d") {
    pastDate = subDays(now, 29);
  } else if (timeRange === "6m") {
    pastDate = subMonths(now, 6);
  } else if (timeRange === "1y") {
    pastDate = subMonths(now, 12);
  } else if (timeRange === "all") {
    pastDate = new Date(
      filteredProducts.reduce(
        (min, p) => (new Date(p.createdAt) < new Date(min) ? p.createdAt : min),
        filteredProducts[0]?.createdAt || now.toISOString()
      )
    );
    pastDate.setHours(0, 0, 0, 0);
  } else {
    pastDate = new Date();
  }

  let dateRange: Date[] = [];
  if (timeRange === "7d" || timeRange === "30d") {
    dateRange = eachDayOfInterval({ start: pastDate, end: now });
  } else if (timeRange === "6m") {
    dateRange = eachWeekOfInterval({ start: pastDate, end: now }, { weekStartsOn: 1 });
  } else if (timeRange === "1y" || timeRange === "all") {
    dateRange = eachMonthOfInterval({ start: pastDate, end: now });
  } else {
    dateRange = eachDayOfInterval({ start: pastDate, end: now });
  }

  const createDateMap = (products: Product[], interval: string) => {
    const map = new Map<string, { quantity: number; income: number }>();

    products.forEach((product) => {
      product.sold.forEach((soldRecord) => {
        const soldDate = new Date(soldRecord.createdAt);
        let date: string;

        if (interval === "7d" || interval === "30d") {
          date = format(soldDate, 'yyyy-MM-dd');
        } else if (interval === "6m") {
          date = format(startOfWeek(soldDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        } else if (interval === "1y" || interval === "all") {
          date = format(startOfMonth(soldDate), 'yyyy-MM');
        } else {
          date = format(soldDate, 'yyyy-MM-dd');
        }

        if (!map.has(date)) {
          map.set(date, { quantity: 0, income: 0 });
        }
        const existing = map.get(date)!;
        map.set(date, {
          quantity: existing.quantity + soldRecord.totalSoldOut,
          income: existing.income + soldRecord.income,
        });
      });
    });

    return map;
  };

  const dateMap = createDateMap(filteredProducts, timeRange);

  const mergedData = dateRange.map((date) => {
    const formattedDate = timeRange === "1y" || timeRange === "all" ? format(date, 'yyyy-MM') : format(date, 'yyyy-MM-dd');
    const data = dateMap.get(formattedDate) || { quantity: 0, income: 0 };
    return {
      date: formattedDate,
      quantity: data.quantity,
      income: data.income,
    };
  });

  const totalProfit = filteredProducts.reduce((total, product) => total + product.profit, 0);

  console.log('Merged Data:', mergedData); // Debugging line to check the merged data

  return (
    <div>
      <Card>
        <CardHeader className="flex items-center sm:items-start gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Sales Analytics Products</CardTitle>
            <CardDescription>
              Showing total sales for the selected time range
            </CardDescription>
            <div className="text-large font-bold">
              Total Quantity Sold: {mergedData.reduce((acc, item) => acc + item.quantity, 0)}
            </div>
            <div className="text-large font-bold">
              Total Income: {formatter.format(mergedData.reduce((acc, item) => acc + item.income, 0))}
            </div>
            <div className="text-large font-bold">
              Total Profit: {formatter.format(totalProfit)}
            </div>
          </div>
          <div className="flex space-x-2">
            <div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto"
                  aria-label="Select a value"
                >
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="7d" className="rounded-lg">
                    Last 7 days
                  </SelectItem>
                  <SelectItem value="30d" className="rounded-lg">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="6m" className="rounded-lg">
                    Last 6 months
                  </SelectItem>
                  <SelectItem value="1y" className="rounded-lg">
                    Last 1 year
                  </SelectItem>
                  <SelectItem value="all" className="rounded-lg">
                    All time
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto"
                  aria-label="Select a product"
                >
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="rounded-lg">
                    All Products
                  </SelectItem>
                  {Array.from(new Set(products.map((product) => product.name))).map((productName) => (
                    <SelectItem key={productName} value={productName} className="rounded-lg">
                      {productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={mergedData}>
              <defs>
                <linearGradient id="fillSoldIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF0000" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF0000" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: any, index: number) => {
                  const date = new Date(value);
                  if (timeRange === "7d" || timeRange === "30d") {
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  } else if (timeRange === "6m") {
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  } else if (timeRange === "1y" || timeRange === "all") {
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    });
                  }
                  return ""; // Default return value
                }}
              />
              <YAxis domain={[(dataMin: number) => Math.min(0, dataMin), 'dataMax']} />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p className="label">{`${label}`}</p>
                        <p className="intro">{`Income: ${formatter.format(payload[0]?.payload?.income || 0)}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                dataKey="income"
                type="monotone"
                fill="url(#fillSoldIncome)"
                stroke="#FF0000"
                name="Income"
              />
              <Legend content={<CustomChartLegendContent label="Income" color="#FF0000" />} />
            </AreaChart>
          </ChartContainer>
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full mb-6">
            <AreaChart data={mergedData}>
              <defs>
                <linearGradient id="fillSoldQuantity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B5AD" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00B5AD" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: any, index: number) => {
                  const date = new Date(value);
                  if (timeRange === "7d" || timeRange === "30d") {
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  } else if (timeRange === "6m") {
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  } else if (timeRange === "1y" || timeRange === "all") {
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    });
                  }
                  return ""; // Default return value
                }}
              />
              <YAxis domain={[(dataMin: number) => Math.min(0, dataMin), 'dataMax']} />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p className="label">{`${label}`}</p>
                        <p className="intro">{`Quantity Sold: ${payload[0]?.payload?.quantity || 0}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                dataKey="quantity"
                type="monotone"
                fill="url(#fillSoldQuantity)"
                stroke="#00B5AD"
                name="Quantity Sold"
              />
              <Legend content={<CustomChartLegendContent label="Quantity Sold" color="#00B5AD" />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomChartLegendContent = ({ label, color }: { label: string; color: string }) => {
  return (
    <div className="custom-legend flex justify-center pt-2">
      <span style={{ color }}>{`■ ${label}`}</span>
    </div>
  );
};

export default StorePerformance;
