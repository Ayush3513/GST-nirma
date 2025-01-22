import React, { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ITCEntry {
  invoiceNumber: string;
  supplierGSTIN: string;
  amount: string;
  date: string;
}

const ITCEligibility = () => {
  const [entries, setEntries] = useState<ITCEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<ITCEntry>({
    invoiceNumber: "",
    supplierGSTIN: "",
    amount: "",
    date: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEntries([...entries, currentEntry]);
    setCurrentEntry({
      invoiceNumber: "",
      supplierGSTIN: "",
      amount: "",
      date: "",
    });
    toast({
      title: "ITC Entry Added",
      description: "Your ITC entry has been successfully added.",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">ITC Eligibility</h1>
            <p className="text-gray-600">Track and validate your input tax credit eligibility</p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Number</label>
                <Input
                  value={currentEntry.invoiceNumber}
                  onChange={(e) =>
                    setCurrentEntry({ ...currentEntry, invoiceNumber: e.target.value })
                  }
                  placeholder="Enter invoice number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier GSTIN</label>
                <Input
                  value={currentEntry.supplierGSTIN}
                  onChange={(e) =>
                    setCurrentEntry({ ...currentEntry, supplierGSTIN: e.target.value })
                  }
                  placeholder="Enter supplier GSTIN"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <Input
                  type="number"
                  value={currentEntry.amount}
                  onChange={(e) =>
                    setCurrentEntry({ ...currentEntry, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={currentEntry.date}
                  onChange={(e) =>
                    setCurrentEntry({ ...currentEntry, date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <Button type="submit">Add Entry</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Invoice Number</th>
                  <th className="text-left p-2">Supplier GSTIN</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{entry.invoiceNumber}</td>
                    <td className="p-2">{entry.supplierGSTIN}</td>
                    <td className="p-2">₹{entry.amount}</td>
                    <td className="p-2">{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ITCEligibility;