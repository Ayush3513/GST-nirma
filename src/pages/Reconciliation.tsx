import React, { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  invoiceNumber: string;
  amount: number;
  status: "matched" | "unmatched" | "partial";
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2024-02-01",
    invoiceNumber: "INV001",
    amount: 25000,
    status: "matched"
  },
  {
    id: "2",
    date: "2024-02-05",
    invoiceNumber: "INV002",
    amount: 15000,
    status: "unmatched"
  },
  {
    id: "3",
    date: "2024-02-10",
    invoiceNumber: "INV003",
    amount: 30000,
    status: "partial"
  }
];

const Reconciliation = () => {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const { toast } = useToast();

  const handleReconcile = () => {
    toast({
      title: "Reconciliation Started",
      description: "The reconciliation process has been initiated.",
    });
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "matched":
        return "text-green-500";
      case "unmatched":
        return "text-red-500";
      case "partial":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "matched":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "unmatched":
      case "partial":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Reconciliation</h1>
            <p className="text-gray-600">Match and reconcile your GST transactions</p>
          </div>
          <Button onClick={handleReconcile}>Start Reconciliation</Button>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Transaction Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Matched Transactions</p>
                <p className="text-2xl font-semibold text-green-600">1</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Unmatched Transactions</p>
                <p className="text-2xl font-semibold text-red-600">1</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Partially Matched</p>
                <p className="text-2xl font-semibold text-yellow-600">1</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Invoice Number</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="p-2">{transaction.date}</td>
                      <td className="p-2">{transaction.invoiceNumber}</td>
                      <td className="p-2">₹{transaction.amount.toLocaleString()}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <span className={getStatusColor(transaction.status)}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reconciliation;