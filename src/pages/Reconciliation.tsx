import React, { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";
import { saveAs } from "file-saver";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ComplianceCheck {
  id: string;
  supplierId: string;
  checkType: string;
  status: string;
  details: string;
  createdAt: string;
}

const Reconciliation = () => {
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheck | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchComplianceChecks = async () => {
      try {
        const { data, error } = await supabase
          .from("compliance_checks")
          .select("*");
        if (error) throw error;
        console.log("Compliance checks:", data);
        
        setComplianceChecks(data);
      } catch (error) {
        console.error("Error fetching compliance checks:", error);
      }
    };

    fetchComplianceChecks();
  }, []);

  const complianceStatusData = {
    labels: ["Passed", "Failed", "Pending"],
    datasets: [
      {
        data: [
          complianceChecks.filter((check) => check.status === "PASS").length,
          complianceChecks.filter((check) => check.status === "FAIL").length,
          complianceChecks.filter((check) => check.status === "PENDING").length,
        ],
        backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
        hoverBackgroundColor: ["#66BB6A", "#EF5350", "#FFCA28"],
      },
    ],
  };

  const handleDownloadDetails = (details: string) => {
    const blob = new Blob([details], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "compliance_check_details.txt");
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Compliance Checks</h1>
            <p className="text-gray-600">Manage your GST compliance checks</p>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Compliance Check Status</h2>
          <div className="flex justify-center items-center">
            <Pie data={complianceStatusData} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Compliance Checks</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created At</th>
                  <th className="text-left p-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {complianceChecks.map((check) => (
                  <tr key={check.id} className="border-b">
                    <td className="p-2">{check.status}</td>
                    <td className="p-2">{check.created_at}</td>
                    <td className="p-2">
                      <Button onClick={() => setSelectedCheck(check)}>View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={!!selectedCheck} onClose={() => setSelectedCheck(null)}>
          <DialogTitle>Compliance Check Details</DialogTitle>
          <DialogContent>
  <h3>Invoice Details</h3>
  <p><strong>Invoice Number:</strong> {selectedCheck?.details?.invoice_number}</p>
  <p><strong>Check Date:</strong> {new Date(selectedCheck?.details?.check_date).toLocaleString()}</p>
  <p><strong>Found in GSTR2B:</strong> {selectedCheck?.details?.found_in_gstr2b ? "Yes" : "No"}</p>
  
  <h4>Invoice Match</h4>
  <p><strong>Total Amount Match:</strong> {selectedCheck?.details?.invoice_match?.total_amount ? "Yes" : "No"}</p>
  <p><strong>Tax Amount Matches:</strong></p>
  <ul>
    <li><strong>CGST:</strong> {selectedCheck?.details?.invoice_match?.tax_amounts?.cgst ? "Yes" : "No"}</li>
    <li><strong>SGST:</strong> {selectedCheck?.details?.invoice_match?.tax_amounts?.sgst ? "Yes" : "No"}</li>
    <li><strong>IGST:</strong> {selectedCheck?.details?.invoice_match?.tax_amounts?.igst ? "Yes" : "No"}</li>
  </ul>
  
  <h4>Supplier Details</h4>
  <p><strong>GSTIN:</strong> {selectedCheck?.details?.supplier_details?.gstin}</p>
  <p><strong>Invoice Date:</strong> {new Date(selectedCheck?.details?.supplier_details?.invoice_date).toLocaleDateString()}</p>
</DialogContent>

          <DialogActions>
            <Button onClick={() => handleDownloadDetails(JSON.stringify(selectedCheck?.details, null, 2))}>
              Download Details
            </Button>
            <Button variant="outlined" onClick={() => setSelectedCheck(null)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Reconciliation;