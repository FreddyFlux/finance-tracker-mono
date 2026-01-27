import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppContext } from "@/contexts/app-context";
import { formatDisplayDate } from "@/lib/formatters";
import { sanitizeDescription } from "@/lib/sanitize";
import {
  amountSchema,
  categoryIdSchema,
  descriptionSchema,
  repeatFrequencySchema,
  transactionDateSchema,
} from "@/lib/validation";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const transactionFormSchema = z
  .object({
    transactionType: z.enum(["income", "expense"]),
    categoryId: categoryIdSchema,
    transactionDate: transactionDateSchema,
    amount: amountSchema,
    description: descriptionSchema.transform(sanitizeDescription),
    isRecurring: z.boolean().default(false),
    repeatFrequency: repeatFrequencySchema.optional(),
    endDate: z.date().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.isRecurring) {
        return data.repeatFrequency !== undefined;
      }
      return true;
    },
    {
      message: "Repeat frequency is required for recurring transactions",
      path: ["repeatFrequency"],
    }
  );

type TransactionFormData = z.infer<typeof transactionFormSchema>;

export function TransactionForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  defaultValues?: {
    transactionType: "income" | "expense";
    amount: number;
    categoryId: number;
    transactionDate: Date;
    description: string;
  };
}) {
  const { categories, isLoading } = useAppContext();
  const form = useForm<TransactionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zodResolver type incompatibility with react-hook-form
    resolver: zodResolver(transactionFormSchema) as any,
    mode: "onSubmit",
    defaultValues: {
      transactionType: "income",
      amount: 0,
      categoryId: 0,
      description: "",
      transactionDate: new Date(),
      isRecurring: false,
      repeatFrequency: undefined,
      endDate: null,
      ...defaultValues,
    },
  });

  const transactionType = form.watch("transactionType");
  const isRecurring = form.watch("isRecurring");

  const filteredCategories = isLoading
    ? []
    : categories.filter((cat) => cat.type === transactionType);

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

  // Reset repeat fields when isRecurring is unchecked
  useEffect(() => {
    if (!isRecurring) {
      form.setValue("repeatFrequency", undefined);
      form.setValue("endDate", null);
      form.clearErrors("repeatFrequency");
      form.clearErrors("endDate");
    }
  }, [isRecurring, form]);

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
                            ? formatDisplayDate(field.value)
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
          {/* RECURRING TRANSACTION OPTIONS */}
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make this transaction recurring</FormLabel>
                  </div>
                </FormItem>
              );
            }}
          />
          {isRecurring && (
            <>
              <FormField
                control={form.control}
                name="repeatFrequency"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Repeat Frequency</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="justify-start font-normal w-full"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? formatDisplayDate(field.value)
                                : "No end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              defaultMonth={field.value ?? new Date()}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                field.onChange(date ?? null);
                              }}
                              disabled={{
                                before: form.getValues("transactionDate"),
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </>
          )}
          <Button type="submit" className="w-full">
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
