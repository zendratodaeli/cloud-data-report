import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  format,
  subDays,
  subMonths,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";
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
import { formatter } from "@/lib/utils";
import { ChartConfig, ChartContainer } from "../ui/chart";
import { Product } from "@/types";
import { Button } from "../ui/button";

interface StorePerformanceProps {
  products: Product[];
  chartRef: React.RefObject<HTMLDivElement>;
}

const chartConfig = {
  soldQuantity: {
    label: "Quantity Sold",
    color: "#00B5AD",
  },
  netIncome: {
    label: "Net Income",
    color: "#FF0000",
  },
  netProfit: {
    label: "Net Profit",
    color: "#008000",
  },
} satisfies ChartConfig;

const StorePerformance: React.FC<StorePerformanceProps> = ({
  products,
  chartRef,
}) => {
  const [timeRange, setTimeRange] = React.useState("7d");
  const [selectedProduct, setSelectedProduct] = React.useState<string>("all");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedMonth, setSelectedMonth] = React.useState<string>("all");
  const { user } = useUser();
  const userId = user?.id;

  console.log(products, "products");

  const storeName = products.map((s) => s.store.name);
  const firstStoreName = storeName[0];

  const filteredProducts = products.filter(
    (product) =>
      (selectedProduct === "all" || product.name === selectedProduct) &&
      (selectedCategory === "all" || product.category.name === selectedCategory)
  );

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
    dateRange = eachWeekOfInterval(
      { start: pastDate, end: now },
      { weekStartsOn: 1 }
    );
  } else if (timeRange === "1y" || timeRange === "all") {
    dateRange = eachMonthOfInterval({ start: pastDate, end: now });
  } else {
    dateRange = eachDayOfInterval({ start: pastDate, end: now });
  }

  const createDateMap = (products: Product[], interval: string) => {
    const map = new Map<
      string,
      { quantity: number; netIncome: number; netProfit: number }
    >();

    products.forEach((product) => {
      product.sold.forEach((soldRecord) => {
        const soldDate = new Date(soldRecord.createdAt);
        let date: string;

        if (interval === "7d" || interval === "30d") {
          date = format(soldDate, "yyyy-MM-dd");
        } else if (interval === "6m") {
          date = format(
            startOfWeek(soldDate, { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          );
        } else if (interval === "1y" || interval === "all") {
          date = format(startOfMonth(soldDate), "yyyy-MM");
        } else {
          date = format(soldDate, "yyyy-MM-dd");
        }

        if (!map.has(date)) {
          map.set(date, { quantity: 0, netIncome: 0, netProfit: 0 });
        }
        const existing = map.get(date)!;
        const netIncome =
          soldRecord.income - soldRecord.income * (product.tax / 100);
        const netProfit = soldRecord.netProfit;

        map.set(date, {
          quantity: existing.quantity + soldRecord.totalSoldOut,
          netIncome: existing.netIncome + netIncome,
          netProfit: existing.netProfit + netProfit,
        });
      });
    });

    return map;
  };

  const dateMap = createDateMap(filteredProducts, timeRange);

  const mergedData = dateRange.map((date) => {
    const formattedDate =
      timeRange === "1y" || timeRange === "all"
        ? format(date, "yyyy-MM")
        : format(date, "yyyy-MM-dd");
    const data = dateMap.get(formattedDate) || {
      quantity: 0,
      netIncome: 0,
      netProfit: 0,
    };
    return {
      date: formattedDate,
      quantity: data.quantity,
      netIncome: data.netIncome,
      netProfit: data.netProfit,
    };
  });

  const months = Array.from(
    new Set(
      products.flatMap((product) =>
        product.sold.map((soldRecord) =>
          format(new Date(soldRecord.createdAt), "yyyy-MM")
        )
      )
    )
  );

  const filteredMergedData =
    selectedMonth === "all"
      ? mergedData
      : mergedData.filter((data) => data.date.startsWith(selectedMonth));

  const mostRecentNonZeroProfit = filteredMergedData
    .slice()
    .reverse()
    .find((item) => item.netProfit !== 0);

  const totalProductsModal = products.reduce((total, product) => {
    return total + Number(product.capital);
  }, 0);

  return (
    <div ref={chartRef}>
      <Card>
        <CardHeader className="flex items-center sm:items-start gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Sales Analytics {firstStoreName}</CardTitle>
            <CardDescription>
              Showing total sales for the selected time range
            </CardDescription>
            <div className="text-large font-semibold">
              Total Net Income:{" "}
              {formatter.format(
                filteredMergedData.reduce(
                  (acc, item) => acc + item.netIncome,
                  0
                )
              )}
            </div>
            <div className="text-large font-semibold">
              Total Quantity Sold:{" "}
              {filteredMergedData.reduce((acc, item) => acc + item.quantity, 0)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className="w-[160px] rounded-lg "
                  aria-label="Select a value"
                >
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="7d" className="rounded-lg">
                    <Button variant="link">Last 7 days</Button>
                  </SelectItem>
                  <SelectItem value="30d" className="rounded-lg">
                    <Button variant="link">Last 30 days</Button>
                  </SelectItem>
                  <SelectItem value="6m" className="rounded-lg">
                    <Button variant="link">Last 6 months</Button>
                  </SelectItem>
                  <SelectItem value="1y" className="rounded-lg">
                    <Button variant="link">Last 1 year</Button>
                  </SelectItem>
                  <SelectItem value="all" className="rounded-lg">
                    <Button variant="link">All time</Button>
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
                    <Button variant="link">All Products</Button>
                  </SelectItem>
                  {Array.from(
                    new Set(products.map((product) => product.name))
                  ).map((productName) => (
                    <SelectItem
                      key={productName}
                      value={productName}
                      className="rounded-lg"
                    >
                      <Button variant="link">{productName}</Button>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto"
                  aria-label="Select a category"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="rounded-lg">
                    <Button variant="link">All Categories</Button>
                  </SelectItem>
                  {Array.from(
                    new Set(products.map((product) => product.category.name))
                  ).map((categoryName) => (
                    <SelectItem
                      key={categoryName}
                      value={categoryName}
                      className="rounded-lg"
                    >
                      <Button variant="link">{categoryName}</Button>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto"
                  aria-label="Select a month"
                >
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="rounded-lg">
                    <Button variant="link">All Months</Button>
                  </SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month} value={month} className="rounded-lg">
                      <Button variant="link">{month}</Button>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredMergedData}>
              <defs>
                <linearGradient
                  id="fillSoldNetIncome"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#FF0000" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF0000" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="fillSoldNetProfit"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#008000" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#008000" stopOpacity={0.1} />
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
              <YAxis
                domain={[(dataMin: number) => Math.min(0, dataMin), "dataMax"]}
              />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p className="label">{`${label}`}</p>
                        <p className="intro">{`Quantity Sold: ${
                          payload[0]?.payload?.quantity || 0
                        }`}</p>
                        <p className="intro">{`Net Income: ${formatter.format(
                          payload[0]?.payload?.netIncome || 0
                        )}`}</p>
                        <p className="intro">{`Net Profit: ${formatter.format(
                          payload[0]?.payload?.netProfit || 0
                        )}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                dataKey="netIncome"
                type="monotone"
                fill="url(#fillSoldNetIncome)"
                stroke="#FF0000"
                name="Net Income"
              />
              <Area
                dataKey="netProfit"
                type="monotone"
                fill="url(#fillSoldNetProfit)"
                stroke="#008000"
                name="Net Profit"
              />
              <Legend />
            </AreaChart>
          </ChartContainer>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full mb-6"
          >
            <AreaChart data={filteredMergedData}>
              <defs>
                <linearGradient
                  id="fillSoldQuantity"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
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
              <YAxis
                domain={[(dataMin: number) => Math.min(0, dataMin), "dataMax"]}
              />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p className="label">{`${label}`}</p>
                        <p className="intro">{`Quantity Sold: ${
                          payload[0]?.payload?.quantity || 0
                        }`}</p>
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
              <Legend
                content={
                  <CustomChartLegendContent
                    label="Quantity Sold"
                    color="#00B5AD"
                  />
                }
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomChartLegendContent = ({
  label,
  color,
}: {
  label: string;
  color: string;
}) => {
  return (
    <div className="custom-legend flex justify-center pt-2">
      <span style={{ color }}>{`■ ${label}`}</span>
    </div>
  );
};

export default StorePerformance;
