"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the Product type
interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  isSold: boolean;
  name: string;
  price: number;
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
}

interface UnrealizedProductProps {
  products: Product[];
}

// Formatter for currency
export const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
});

const chartConfig = {
  price: {
    label: "Unrealized Revenue",
    color: "#FF0000", // Red color for the legend
  },
} satisfies ChartConfig;

const UnrealizedProduct: React.FC<UnrealizedProductProps> = ({ products }) => {
  const [timeRange, setTimeRange] = React.useState("7d");
  const [selectedProduct, setSelectedProduct] = React.useState<string>("all");

  // Filter products where isSold is false
  const unsoldProducts = products.filter((product) => !product.isSold);

  // Filter products based on the selected product
  const filteredProducts =
    selectedProduct === "all"
      ? unsoldProducts
      : unsoldProducts.filter((product) => product.name === selectedProduct);

  const now = new Date();
  let pastDate: Date;

  if (timeRange === "7d") {
    pastDate = subDays(now, 6); // Last 7 days including today
  } else if (timeRange === "30d") {
    pastDate = subDays(now, 29); // Last 30 days including today
  } else if (timeRange === "6m") {
    pastDate = subMonths(now, 6); // Last 6 months
  } else if (timeRange === "1y") {
    pastDate = subMonths(now, 12); // Last 1 year
  } else if (timeRange === "all") {
    pastDate = new Date(
      filteredProducts.reduce(
        (min, p) => (new Date(p.createdAt) < new Date(min) ? p.createdAt : min),
        filteredProducts[0].createdAt
      )
    );
    pastDate.setHours(0, 0, 0, 0); // Set to start of the day
  } else {
    pastDate = new Date(); // Default to now if no valid time range is provided
  }

  // Aggregate product data by date
  const aggregateData = (products: Product[], interval: string) => {
    const data: Record<string, number> = {};

    products.forEach((product) => {
      let date: string;
      const productDate = new Date(product.createdAt);

      if (interval === "7d" || interval === "30d") {
        // Group by day
        date = format(productDate, 'yyyy-MM-dd');
      } else if (interval === "6m") {
        // Group by week
        date = format(startOfWeek(productDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      } else if (interval === "1y" || interval === "all") {
        // Group by month
        date = format(startOfMonth(productDate), 'yyyy-MM');
      } else {
        date = format(productDate, 'yyyy-MM-dd'); // Default to daily if no valid interval is provided
      }

      if (!data[date]) {
        data[date] = 0;
      }
      data[date] += product.price;
    });

    return Object.keys(data).map((date) => ({
      date,
      price: data[date],
    }));
  };

  const fillMissingDates = (
    data: { date: string; price: number }[],
    startDate: Date,
    endDate: Date,
    interval: string
  ) => {
    let filledDates: Date[] = [];

    if (interval === "7d" || interval === "30d") {
      filledDates = eachDayOfInterval({ start: startDate, end: endDate });
    } else if (interval === "6m") {
      filledDates = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
    } else if (interval === "1y" || interval === "all") {
      filledDates = eachMonthOfInterval({ start: startDate, end: endDate });
    } else {
      filledDates = eachDayOfInterval({ start: startDate, end: endDate });
    }

    const filledData = filledDates.map(date => {
      const dateString = interval === "1y" || interval === "all" ? format(date, 'yyyy-MM') : format(date, 'yyyy-MM-dd');
      const existingData = data.find(item => item.date === dateString);
      return existingData ? existingData : { date: dateString, price: 0 };
    });

    return filledData;
  };

  const chartData = aggregateData(filteredProducts, timeRange);

  // Ensure current date is included in the chartData
  const today = format(now, 'yyyy-MM-dd');
  let todayData = chartData.find((item) => item.date === today);

  if (!todayData) {
    todayData = { date: today, price: 0 };
    chartData.push(todayData);
  }

  // Debugging statement to check todayData
  console.log(`Today's data: ${JSON.stringify(todayData)}`);
  console.log(`Chart Data before fillMissingDates: ${JSON.stringify(chartData)}`);

  // Sort chartData before filling missing dates
  const sortedChartData = chartData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filledData = fillMissingDates(sortedChartData, pastDate, now, timeRange);

  const sortedData = filledData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  console.log(`Sorted Data: ${JSON.stringify(sortedData)}`);

  const totalPrice = sortedData.reduce((sum, item) => sum + item.price, 0);
  const allTimeTotalPrice = unsoldProducts.reduce((sum, product) => sum + product.price, 0);

  return (
    <div>
      <Card>
        <CardHeader className="flex items-center sm:items-start gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Daily Unrealized Sales Analytics</CardTitle>
            <CardDescription>
              Showing total unrealized sales for the selected time range
            </CardDescription>
            <div className="text-large font-bold">
              Total Unrealized: (-) {formatter.format(allTimeTotalPrice)}
            </div>
            <div className="text-large font-bold">
              Selected Unrealized: (-) {formatter.format(totalPrice)}
            </div>
          </div>

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

          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
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
              {Array.from(new Set(unsoldProducts.map((product) => product.name))).map(
                (productName) => (
                  <SelectItem key={productName} value={productName} className="rounded-lg">
                    {productName}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={sortedData}>
              <defs>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="#FF0000"
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="100%"
                    stopColor="#FF0000"
                    stopOpacity={0.1}
                  />
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
                  } else if (timeRange === "6m" || timeRange === "1y" || timeRange === "all") {
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    });
                  }
                  return ""; // Default return value
                }}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    formatter={(value) => formatter.format(value as number)}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="price"
                type="natural"
                fill="#E06666"
                stroke="#FF0000" // Change the stroke color to red
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnrealizedProduct;
