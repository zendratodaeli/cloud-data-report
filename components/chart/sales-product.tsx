"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

interface SalesProductProps {
  products: Product[];
}

// Formatter for currency
export const formatter = new Intl.NumberFormat("id-ID", {
  style: 'currency',
  currency: 'IDR'
});

const chartConfig = {
  price: {
    label: "Price",
    color: "#00B5AD", // Adjusted color to match the image
  },
} satisfies ChartConfig

const SalesProduct: React.FC<SalesProductProps> = ({ products }) => {
  const [timeRange, setTimeRange] = React.useState("7d")

  // Aggregate product data by date
  const aggregateData = (products: Product[], interval: string) => {
    const data: Record<string, number> = {};

    products.forEach(product => {
      let date: string;
      const productDate = new Date(product.createdAt);

      if (interval === "7d" || interval === "all") {
        // Group by day
        date = productDate.toISOString().split('T')[0];
      } else if (interval === "30d") {
        // Group by week
        const startOfWeek = new Date(productDate);
        startOfWeek.setDate(productDate.getDate() - productDate.getDay());
        date = startOfWeek.toISOString().split('T')[0];
      } else if (interval === "6m" || interval === "1y") {
        // Group by month
        date = `${productDate.getFullYear()}-${(productDate.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        date = productDate.toISOString().split('T')[0]; // Default to daily if no valid interval is provided
      }

      if (!data[date]) {
        data[date] = 0;
      }
      data[date] += product.price;
    });

    return Object.keys(data).map(date => ({
      date,
      price: data[date]
    }));
  };

  const fillMissingDates = (data: { date: string, price: number }[], startDate: Date, endDate: Date, interval: string) => {
    const filledData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let dateString: string;

      if (interval === "30d") {
        // Weekly intervals
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        dateString = startOfWeek.toISOString().split('T')[0];
        currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
      } else if (interval === "6m" || interval === "1y") {
        // Monthly intervals
        dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        currentDate.setMonth(currentDate.getMonth() + 1); // Move to the next month
      } else {
        // Daily intervals
        dateString = currentDate.toISOString().split('T')[0];
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }

      const existingData = data.find(item => item.date === dateString);

      if (existingData) {
        filledData.push(existingData);
      } else {
        filledData.push({ date: dateString, price: 0 });
      }
    }

    return filledData;
  };

  const chartData = aggregateData(products, timeRange);

  const now = new Date();
  let pastDate: Date;

  if (timeRange === "7d") {
    pastDate = new Date();
    pastDate.setDate(now.getDate() - 7);
  } else if (timeRange === "30d") {
    pastDate = new Date();
    pastDate.setMonth(now.getMonth() - 1);
  } else if (timeRange === "6m") {
    pastDate = new Date();
    pastDate.setMonth(now.getMonth() - 6);
  } else if (timeRange === "1y") {
    pastDate = new Date();
    pastDate.setFullYear(now.getFullYear() - 1);
  } else if (timeRange === "all") {
    pastDate = new Date(products.reduce((min, p) => p.createdAt < min ? p.createdAt : min, products[0].createdAt));
  } else {
    pastDate = new Date(); // Default to now if no valid time range is provided
  }

  // Fill missing dates
  const filledData = fillMissingDates(chartData, pastDate, now, timeRange);

  // Sort data by date in ascending order
  const sortedData = filledData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate total price for the selected time range
  const totalPrice = sortedData.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Daily Sales Analytics - Interactive</CardTitle>
            <CardDescription>
              Showing total sales for the selected time range
            </CardDescription>
            <div className="text-xl font-bold">
            Revenue: {formatter.format(totalPrice)}
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
                    offset="5%"
                    stopColor="#00B5AD" // Adjusted color to match the image
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#00B5AD" // Adjusted color to match the image
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
                  if (timeRange === "7d" || timeRange === "all") {
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  } else if (timeRange === "30d") {
                    const options = { month: 'short', day: 'numeric' } as const;
                    const endOfWeek = new Date(date);
                    endOfWeek.setDate(endOfWeek.getDate() + 6);
                    return `${date.toLocaleDateString("en-US", options)} - ${endOfWeek.toLocaleDateString("en-US", options)}`;
                  } else if (timeRange === "6m" || timeRange === "1y") {
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    });
                  }
                  return ''; // Default return value
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
                        year: "numeric"
                      })
                    }}
                    formatter={(value) => formatter.format(value as number)}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="price"
                type="natural"
                fill="url(#fillPrice)"
                stroke="#00B5AD" // Adjusted color to match the image
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesProduct
