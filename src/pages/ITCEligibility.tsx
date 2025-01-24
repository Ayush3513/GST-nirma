import React, { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Cross, DownloadIcon, ShieldCloseIcon } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  buyer_gstin: string;
  supplier_gstin: string;
  cgst: number;
  sgst: number;
  igst: number;
  total_amount: number;
  reconciliation_status: string;
  itc_eligible: boolean;
  created_at: string;
  updated_at: string;
}

const ITCEligibility = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*');

      if (error) {
        setInvoices([]);
        toast({
          title: "Error",
          description: "Failed to fetch invoices. Please try again later.",
        });
      } else {
        setInvoices(data);
      }
    };

    fetchInvoices();
  }, []);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleDownload = () => {
    if (selectedInvoice) {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(selectedInvoice, null, 2)], {
        type: "application/json",
      });
      element.href = URL.createObjectURL(file);
      element.download = `${selectedInvoice.invoice_number}_details.json`;
      document.body.appendChild(element);
      element.click();
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleSort = () => {
    const sortedInvoices = [...invoices].sort((a, b) => {
      if (sortAsc) {
        return a.itc_eligible === b.itc_eligible ? 0 : a.itc_eligible ? -1 : 1;
      } else {
        return a.itc_eligible === b.itc_eligible ? 0 : a.itc_eligible ? 1 : -1;
      }
    });
    setInvoices(sortedInvoices);
    setSortAsc(!sortAsc);
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
          <h2 className="text-lg font-semibold mb-4">Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Invoice Number</th>
                  <th className="text-left p-2">Supplier GSTIN</th>
                  <th className="text-left p-2">Total Amount</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">
                    ITC Eligible
                    <Button onClick={handleSort} className="ml-2">
                      {sortAsc ? "↑" : "↓"}
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    Reconsiliation Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr key={index} className="border-b cursor-pointer" onClick={() => handleInvoiceClick(invoice)}>
                    <td className="p-2">{invoice.invoice_number}</td>
                    <td className="p-2">{invoice.supplier_gstin}</td>
                    <td className="p-2">₹{invoice.total_amount}</td>
                    <td className="p-2">{invoice.invoice_date}</td>
                    <td className="p-2 w-full flex justify-start">
                      <p
                        className={`${invoice.itc_eligible
                            ? 'bg-green-400 rounded-full text-center w-10'
                            : 'bg-red-400 rounded-full text-center w-10'
                          }`}
                      >
                        {invoice.itc_eligible ? "Yes" : "No"}
                      </p>
                    </td>
                    
                    <td className="p-2 w-">
                      <p
                        className={`${invoice.reconciliation_status === 'MATCHED'
                            ? 'bg-green-400 rounded-full text-center w-20'
                            : 'bg-red-400 rounded-full text-center w-20'
                          }`}
                      >
                        {invoice.reconciliation_status }
                      </p>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <div />
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              Invoice Details

            </DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <div className="space-y-4">
                  <div>
                    <strong>Invoice Number:</strong> {selectedInvoice.invoice_number}
                  </div>
                  <div>
                    <strong>Supplier GSTIN:</strong> {selectedInvoice.supplier_gstin}
                  </div>
                  <div>
                    <strong>Total Amount:</strong> ₹{selectedInvoice.total_amount}
                  </div>
                  <div>
                    <strong>Date:</strong> {selectedInvoice.invoice_date}
                  </div>
                  <div>
                    <strong>Reconciliation Status:</strong> {selectedInvoice.reconciliation_status}
                  </div>
                  <div>
                    <strong>ITC Eligible:</strong> {selectedInvoice.itc_eligible ? "Yes" : "No"}
                  </div>
                </div>
              )}
            </DialogDescription>
            <div className="flex justify-end mt-4">
              <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
                Download Details
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ITCEligibility;