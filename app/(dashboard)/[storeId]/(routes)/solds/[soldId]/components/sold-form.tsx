"use client";

import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Category, Product } from "@prisma/client";
import { Trash } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  totalSoldOut: z.coerce.number().min(1, "Must be at least 1"),
  categoryId: z.string().min(1, "Category is required"),
  createdAt: z.string().optional(),
});

type SoldFormValues = z.infer<typeof formSchema>;

interface SoldFormProps {
  initialData: {
    id: string;
    productId: string;
    totalSoldOut: number;
    categoryId: string;
    createdAt: Date;
  } | null;
  products: Product[];
  categories: Category[];
}

const SoldForm: React.FC<SoldFormProps> = ({
  initialData,
  products,
  categories,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remainQuantity, setRemainQuantity] = useState<number | null>(null);
  const [originalTotalSoldOut, setOriginalTotalSoldOut] = useState<number>(
    initialData ? initialData.totalSoldOut : 0
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData ? initialData.categoryId : ""
  );
  const [productCreatedAt, setProductCreatedAt] = useState<string>("");

  const params = useParams();
  const router = useRouter();

  const title = initialData ? "Edit a Sold Record" : "Create a Sold Record";
  const description = initialData
    ? "Edit a Sold Record"
    : "Add a new Sold Record";
  const toastMessage = initialData
    ? "Sold Record Updated"
    : "Sold Record created.";
  const action = initialData ? "Save changes" : "Create";

  const todayDate = format(new Date(), "yyyy-MM-dd");

  const form = useForm<SoldFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          productId: initialData.productId,
          categoryId: initialData.categoryId,
          totalSoldOut: initialData.totalSoldOut,
          createdAt: format(new Date(initialData.createdAt), "yyyy-MM-dd"),
        }
      : {
          productId: "",
          categoryId: "",
          totalSoldOut: 1,
          createdAt: todayDate,
        },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "productId") {
        const selectedProduct = products.find(
          (product) => product.id === value.productId
        );
        setRemainQuantity(
          selectedProduct ? selectedProduct.remainQuantity : null
        );
        setSelectedCategory(selectedProduct ? selectedProduct.categoryId : "");
        const productDate = selectedProduct
          ? format(new Date(selectedProduct.createdAt), "yyyy-MM-dd")
          : "";
        setProductCreatedAt(productDate || "");
        form.setValue(
          "categoryId",
          selectedProduct ? selectedProduct.categoryId : "",
          { shouldValidate: true }
        );
        form.setValue("createdAt", productDate || todayDate, {
          shouldValidate: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, products]);

  const onSubmit = async (data: SoldFormValues) => {
    const quantityDifference = data.totalSoldOut - originalTotalSoldOut;
    const selectedProduct = products.find(
      (product) => product.id === data.productId
    );

    if (remainQuantity !== null && quantityDifference > remainQuantity) {
      toast.error(`Cannot sell more than ${remainQuantity} additional items`);
      return;
    }

    if (selectedProduct) {
      const selectedDate = new Date(data.createdAt!);
      const productDate = new Date(selectedProduct.createdAt);
      if (selectedDate < productDate) {
        toast.error(
          `The selected date cannot be before the product creation date (${
            productDate.toISOString().split("T")[0]
          })`
        );
        return;
      }
    }

    try {
      setLoading(true);

      // Check for duplicate entry
      const duplicateCheckResponse = await axios.get(
        `/api/${params.storeId}/solds`,
        {
          params: {
            productId: data.productId,
            categoryId: data.categoryId,
            createdAt: data.createdAt,
          },
        }
      );

      if (duplicateCheckResponse.data.length > 0) {
        toast.error(
          "A record already exists for the selected product and date."
        );
        setLoading(false);
        return;
      }

      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/solds/${initialData.id}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/solds`, data);
      }

      router.push(`/${params.storeId}/solds`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong. It is forbidden to duplicate the entry date for the same product & category. Choose other dates.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      await axios.delete(`/api/${params.storeId}/solds/${initialData?.id}`);

      router.refresh();
      router.push(`/${params.storeId}/solds`);
      toast.success("Sold record deleted");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between pt-16">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant={"destructive"}
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const selectedProduct = products.find(
                        (product) => product.id === value
                      );
                      setRemainQuantity(
                        selectedProduct ? selectedProduct.remainQuantity : null
                      );
                      setSelectedCategory(
                        selectedProduct ? selectedProduct.categoryId : ""
                      );
                      const productDate = selectedProduct
                        ? format(
                            new Date(selectedProduct.createdAt),
                            "yyyy-MM-dd"
                          )
                        : "";
                      setProductCreatedAt(productDate || "");
                      form.setValue(
                        "categoryId",
                        selectedProduct ? selectedProduct.categoryId : "",
                        { shouldValidate: true }
                      );
                      form.setValue("createdAt", productDate || todayDate, {
                        shouldValidate: true,
                      });
                    }}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a product"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a category"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalSoldOut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Sold Out</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="Number of items sold"
                      {...field}
                      max={
                        remainQuantity !== null
                          ? remainQuantity + originalTotalSoldOut
                          : undefined
                      }
                    />
                  </FormControl>
                  {remainQuantity !== null && (
                    <FormDescription>
                      Max available: {remainQuantity + originalTotalSoldOut}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={loading}
                      {...field}
                      min={productCreatedAt}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default SoldForm;
