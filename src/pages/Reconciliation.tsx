import React, { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";



interface Transaction {
  id: string;
  date: string;
  invoiceNumber: string;
  amount: number;
  status: "matched" | "unmatched" | "partial";
  checkDate: string;
  foundInGstr2b: boolean;
  invoiceMatch: boolean;
  supplierDetails: string;
}

interface ComplianceCheck {
  id: string;
  supplierId: string;
  checkType: string;
  status: string;
  details: string;
  createdAt: string;
}

const Reconciliation = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [activeTab, setActiveTab] = useState<"reconciliation" | "compliance">("reconciliation");
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*");
        if (error) throw error;
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    const fetchComplianceChecks = async () => {
      try {
        const { data, error } = await supabase
          .from("compliance_checks")
          .select("*");
        if (error) throw error;
        setComplianceChecks(data);
      } catch (error) {
        console.error("Error fetching compliance checks:", error);
      }
    };

    fetchTransactions();
    fetchComplianceChecks();
  }, []);

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
            <h1 className="text-2xl font-semibold">Reconciliation & Compliance</h1>
            <p className="text-gray-600">Manage your GST transactions and compliance checks</p>
          </div>
          <Button onClick={handleReconcile}>Start Reconciliation</Button>
        </div>

        <div className="flex space-x-4">
          <Button variant={activeTab === "reconciliation" ? "solid" : "outline"} onClick={() => setActiveTab("reconciliation")}>
            Reconciliation
          </Button>
          <Button variant={activeTab === "compliance" ? "solid" : "outline"} onClick={() => setActiveTab("compliance")}>
            Compliance
          </Button>
        </div>

        {activeTab === "reconciliation" && (
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
                      <th className="text-left p-2">Check Date</th>
                      <th className="text-left p-2">Found in GSTR2B</th>
                      <th className="text-left p-2">Invoice Match</th>
                      <th className="text-left p-2">Supplier Details</th>
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
                        <td className="p-2">{transaction.checkDate}</td>
                        <td className="p-2">{transaction.foundInGstr2b ? "Yes" : "No"}</td>
                        <td className="p-2">{transaction.invoiceMatch ? "Yes" : "No"}</td>
                        <td className="p-2">{transaction.supplierDetails}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Compliance Checks</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Check Type</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Details</th>
                      <th className="text-left p-2">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceChecks.map((check) => (
                      <tr key={check.id} className="border-b">
                        <td className="p-2">{check.checkType}</td>
                        <td className="p-2">{check.status}</td>
                        <td className="p-2">{check.details}</td>
                        <td className="p-2">{check.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Reconciliation;