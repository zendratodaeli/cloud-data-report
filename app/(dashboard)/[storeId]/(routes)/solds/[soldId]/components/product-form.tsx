"use client";

import * as z from "zod";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Product } from "@prisma/client";
import { Trash } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  productId: z.string().min(1),
  totalSoldOut: z.coerce.number().min(1),
  createdAt: z.string().optional(),
});

type SoldFormValues = z.infer<typeof formSchema>;

interface SoldFormProps {
  initialData: { id: string; productId: string; totalSoldOut: number; createdAt: Date } | null;
  products: Product[];
}

const SoldForm: React.FC<SoldFormProps> = ({ initialData, products }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const params = useParams();
  const router = useRouter();

  const title = initialData ? "Edit a Sold Record" : "Create a Sold Record";
  const description = initialData ? "Edit a Sold Record" : "Add a new Sold Record";
  const toastMessage = initialData ? "Sold Record Updated" : "Sold Record created.";
  const action = initialData ? "Save changes" : "Create";

  const todayDate = format(new Date(), 'yyyy-MM-dd'); // Ensure today's date is correctly formatted

  const form = useForm<SoldFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? { 
      productId: initialData.productId,
      totalSoldOut: initialData.totalSoldOut,
      createdAt: format(new Date(initialData.createdAt), 'yyyy-MM-dd'), // Ensure the date is correctly formatted
    } : {
      productId: '',
      totalSoldOut: 1,
      createdAt: todayDate, // Use today's date as the default value
    },
  });

  const onSubmit = async (data: SoldFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/solds/${initialData.id}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/solds`, data);
      }

      router.push(`/${params.storeId}/solds`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between pt-16">
        <Heading 
          title={title}
          description={description}
        />
        {initialData && (
          <Button
            disabled={loading}
            variant={"destructive"}
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4"/>
          </Button>
        )}
      </div>
      <Separator/>
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
                    onValueChange={field.onChange} 
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
                        <SelectItem
                          key={product.id}
                          value={product.id}
                        >
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
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
                    />
                  </FormControl>
                  <FormMessage/>
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
                    />
                  </FormControl>
                  <FormMessage/>
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
}

export default SoldForm;
