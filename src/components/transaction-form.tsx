import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { useEffect } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Input } from "./ui/input";
import { categoriesTable } from "@/db/schema";

export const transactionFormSchema = z.object({
  transactionType: z.enum(["income", "expense"]),
  categoryId: z.coerce.number().positive("Please select a category"),
  transactionDate: z
    .date()
    .max(addDays(new Date(), 1), "Transaction date cannot be in the future"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(300, "Description must be less than 300 characters"),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

export function TransactionForm({
  categories,
  onSubmit,
  defaultValues,
}: {
  categories: (typeof categoriesTable.$inferSelect)[];
  onSubmit: (data: TransactionFormData) => Promise<void>;
  defaultValues?: {
    transactionType: "income" | "expense";
    amount: number;
    categoryId: number;
    transactionDate: Date;
    description: string;
  };
}) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema) as any,
    mode: "onSubmit",
    defaultValues: {
      transactionType: "income",
      amount: 0,
      categoryId: 0,
      description: "",
      transactionDate: new Date(),
      ...defaultValues,
    },
  });

  const transactionType = form.watch("transactionType");

  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );

  // Reset categoryId when transaction type changes (but not on initial mount)
  useEffect(() => {
    // Only reset if categoryId is set and doesn't match the current transaction type
    const currentCategoryId = form.getValues("categoryId");
    if (currentCategoryId !== 0) {
      const currentCategory = categories.find(
        (cat) => cat.id === currentCategoryId
      );
      // Only reset if the current category doesn't match the transaction type
      if (currentCategory && currentCategory.type !== transactionType) {
        form.setValue("categoryId", 0);
        form.clearErrors("categoryId");
      }
    }
  }, [transactionType, form, categories]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="grid grid-cols-2 gap-y-5 gap-x-2"
        >
          {/* TRANSACTION TYPE FIELD */}
          <FormField
            control={form.control}
            name="transactionType"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Transaction Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          {/* CATEGORY ID FIELD */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value === 0 ? "" : field.value.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {filteredCategories.map((category) => (
                          <SelectItem
                            className="w-full"
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* TRANSACTION DATE FIELD */}
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Transaction Date</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date"
                          className="justify-start font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "do MMM yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          defaultMonth={field.value}
                          captionLayout="dropdown"
                          onSelect={field.onChange}
                          disabled={{ after: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          {/* AMOUNT FIELD */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step={0.01}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </fieldset>
        {/* DESCRIPTION FIELD */}
        <fieldset
          disabled={form.formState.isSubmitting}
          className="mt-5 flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button type="submit" className="w-full">
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
