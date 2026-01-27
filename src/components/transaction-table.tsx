import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { formatDisplayDate, formatCurrency } from "@/lib/formatters";
import { Transaction, TransactionType } from "@/lib/types";
import { TRANSACTION_TYPE_COLORS } from "@/lib/constants";
import { PencilIcon } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

interface TransactionTableProps {
  transactions: Transaction[];
  showEditButton?: boolean;
}

export function TransactionTable({
  transactions,
  showEditButton = false,
}: TransactionTableProps) {
  const router = useRouter();

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          {showEditButton && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{formatDisplayDate(transaction.transactionDate)}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell className="capitalize">
              <TransactionTypeBadge transactionType={transaction.transactionType} />
            </TableCell>
            <TableCell>{transaction.category}</TableCell>
            <TableCell>{formatCurrency(transaction.amount, true)}</TableCell>
            {showEditButton && (
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Edit Transaction"
                  asChild
                >
                  <Link
                    onClick={() => {
                      router.clearCache({
                        filter: (route) =>
                          route.pathname !==
                          `/dashboard/transactions/${transaction.id}`,
                      });
                    }}
                    to="/dashboard/transactions/$transactionId"
                    params={{ transactionId: transaction.id.toString() }}
                  >
                    <PencilIcon />
                  </Link>
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface TransactionTypeBadgeProps {
  transactionType: TransactionType | null;
}

function TransactionTypeBadge({ transactionType }: TransactionTypeBadgeProps) {
  if (!transactionType) return null;

  return (
    <Badge className={TRANSACTION_TYPE_COLORS[transactionType]}>
      {transactionType}
    </Badge>
  );
}
