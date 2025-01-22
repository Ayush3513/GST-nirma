import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/Layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";// Ensure you have a Supabase client set up
import { Invoice } from "@/integrations/supabase/types"; // Implied import for the Invoice type
import { useNavigate } from "react-router-dom";
import { checkITCEligibility } from "@/service/ITCeligibilty";
import { reconcileInvoice } from "@/service/reconcile";

export default function InvoiceUpload() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Function to upload the file and process it using Mindee API
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("document", file);

        // Step 1: Make the API request to upload the document
        const response = await fetch(
          "https://api.mindee.net/v1/products/gstnnnnnnn/invoice_calc/v1/predict_async", // Correct URL for async prediction
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Token 1c159ed6727d707620f8ffd39456a7d5", // Replace with your actual API key
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Step 2: Extract the job_id from the response
        const jobId = data.job.id;
        if (!jobId) {
          throw new Error("Job ID not found in the response.");
        }

        console.log("Job ID:", jobId); // Log for debugging

        // Step 3: Start polling for the job status
        await pollJobStatus(jobId);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Error processing invoice",
          description:
            error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [toast]
  );

  // Function to poll job status
  const pollJobStatus = async (jobId: string) => {
    try {
      const pollingInterval = 5000; // Poll every 5 seconds to give the system time to process

      const fetchJobStatus = async () => {
        const response = await fetch(
          `https://api.mindee.net/v1/products/gstnnnnnnn/invoice_calc/v1/documents/queue/${jobId}`,
          {
            method: "GET",
            headers: {
              Authorization: "Token 1c159ed6727d707620f8ffd39456a7d5", // Replace with your actual API key
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Polling response:", data);

        const jobStatus = data.job.status;

        if (jobStatus === "success" || jobStatus === "completed") {
          console.log("Job finished, fetching prediction data...");
          await fetchPredictionData(jobId); // Fetch the prediction results
        } else if (jobStatus === "waiting" || jobStatus === "processing") {
          console.log("Job is still processing, retrying...");
          setTimeout(fetchJobStatus, pollingInterval); // Retry after the defined interval
        } else {
          throw new Error(`Job failed with status: ${jobStatus}`);
        }
      };

      // Start polling
      fetchJobStatus();
    } catch (error) {
      console.error("Error polling job status:", error);
      toast({
        title: "Error checking job status",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Function to retrieve the prediction data using job ID
 const fetchPredictionData = async (jobId: string) => {
   const maxRetries = 5;
   let retryCount = 0;

   const fetchWithRetry = async () => {
     try {
       const response = await fetch(
         `https://api.mindee.net/v1/products/gstnnnnnnn/invoice_calc/v1/documents/queue/${jobId}`,
         {
           method: "GET",
           headers: {
             Authorization: "Token 1c159ed6727d707620f8ffd39456a7d5", // Replace with your actual API key
           },
         }
       );

       if (!response.ok) {
         if (response.status === 429 && retryCount < maxRetries) {
           // Apply backoff if rate limit is exceeded
           retryCount++;
           const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
           console.log(`Rate limit hit. Retrying in ${backoffTime / 1000}s...`);
           setTimeout(fetchWithRetry, backoffTime);
           return;
         }
         throw new Error(`HTTP error! Status: ${response.status}`);
       }

       const data = await response.json();
       console.log("Prediction Data:", data);

       const importantData = data.document.inference.prediction;

       if (importantData) {
         setInvoiceData({
           invoiceNumber: importantData.invoicenumber?.value || "",
           invoiceDate: importantData.invoice_date?.value || "",
           buyerGstin: importantData.buyergstin?.value || "",
           supplierGstin: importantData.suppliergstin?.value || "",
           taxAmount: {
             cgst: parseFloat(importantData.taxamount?.cgst) || 0,
             sgst: parseFloat(importantData.taxamount?.sgst) || 0,
             igst: parseFloat(importantData.taxamount?.igst) || 0,
             totalAmount: parseFloat(importantData.taxamount?.total_amount) || 0,
           },
         });

         toast({
           title: "Invoice processed successfully",
           description: `Extracted data for invoice: ${
             importantData.invoicenumber?.value || "Unknown"
           }`,
         });
       } else {
         console.log("Prediction data is still empty or incomplete.");
       }
     } catch (error) {
       console.error("Error fetching prediction data:", error);
       toast({
         title: "Error fetching prediction",
         description:
           error instanceof Error ? error.message : "Please try again later.",
         variant: "destructive",
       });
     }
   };

   fetchWithRetry();
 };

  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);
  const GSTIN_REGEX = /^GSTIN[0-9]{7}$/;

  const validateGSTIN = (gstin: string): boolean => {
    return GSTIN_REGEX.test(gstin);
  };

  const handleSubmit = async () => {
    if (!invoiceData) return;
  
    try {
      // Step 2: First save invoice to database
      const { data: savedInvoice, error: insertError } = await supabase
        .from('invoices')
        .insert([
          {
            id: crypto.randomUUID(),
            invoice_number: invoiceData.invoiceNumber,
            invoice_date: invoiceData.invoiceDate,
            buyer_gstin: invoiceData.buyerGstin.toUpperCase(),
            supplier_gstin: invoiceData.supplierGstin.toUpperCase(),
            cgst: invoiceData.taxAmount.cgst || 0,
            sgst: invoiceData.taxAmount.sgst || 0,
            igst: invoiceData.taxAmount.igst || 0,
            total_amount: invoiceData.taxAmount.totalAmount || 0,
            reconciliation_status: 'PENDING',
            itc_eligible: false
          }
        ])
        .select()
        .single();
  
      if (insertError) throw insertError;
      if (!savedInvoice) throw new Error('Failed to save invoice');


  
      toast({
        title: "Invoice saved successfully",
        description: "Now checking eligibility and reconciliation...",
      });
  
      // Step 3: Check ITC eligibility
      toast({ title: "Checking ITC eligibility..." });
      const eligibilityResult = await checkITCEligibility(savedInvoice);
  
      // Step 4: Perform reconciliation
      toast({ title: "Performing reconciliation..." });
      const reconciliationStatus = await reconcileInvoice(savedInvoice);
  
      // Step 5: Show final results
      toast({
        title: "Process completed",
        description: 
          `Status: ${eligibilityResult.verificationStatus}\n` +
          `Reconciliation: ${reconciliationStatus}\n` +
          `ITC Eligible: ${eligibilityResult.isEligible ? 'Yes' : 'No'}\n` +
          `Amount: ₹${eligibilityResult.eligibleAmount}`,
        variant: eligibilityResult.isEligible ? "default" : "destructive",
      });
      queryClient.invalidateQueries(['invoices']);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error processing invoice",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };
  

  return (
    <MainLayout>
      <Card className="p-6 shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-2xl font-semibold mb-4 text-center">Upload Your Invoice</h1>
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-12 text-center transition-all duration-300 ${
            isUploading ? "opacity-50" : "hover:border-primary-500"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {isUploading ? (
                "Processing invoice..."
              ) : (
                <>
                  Drag and drop your invoice files here, or{" "}
                  <label className="text-primary hover:text-primary/80 cursor-pointer">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      disabled={isUploading}
                    />
                  </label>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supports: PDF, JPG, PNG (Max 10MB)
            </p>
          </div>
        </div>
      </Card>

      {/* Render invoice data */}
      {invoiceData && (
        <Card className="mt-6 p-4 shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                className="border rounded p-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                className="border rounded p-2 w-full"
              />
            </div>
            <div>
  <label className="block text-sm font-medium mb-1">
    Buyer GSTIN
    {invoiceData.buyerGstin && (
      <span className="text-red-500 text-xs ml-2">Invalid GSTIN format</span>
    )}
  </label>
  <input
    type="text"
    value={invoiceData.buyerGstin}
    onChange={(e) => {
      const value = e.target.value.toUpperCase();
      setInvoiceData({ ...invoiceData, buyerGstin: value });
    }}
    pattern="^GSTIN[0-9]{7}$"
    placeholder="GSTIN9876543"
    className={`border rounded p-2 w-full ${
      invoiceData.buyerGstin
        ? 'border-red-500' 
        : ''
    }`}
  />
</div>
<div>
  <label className="block text-sm font-medium mb-1">
    Supplier GSTIN
    {invoiceData.supplierGstin && !validateGSTIN(invoiceData.supplierGstin) && (
      <span className="text-red-500 text-xs ml-2">Invalid GSTIN format</span>
    )}
  </label>
  <input
    type="text"
    value={invoiceData.supplierGstin}
    onChange={(e) => {
      const value = e.target.value.toUpperCase();
      setInvoiceData({ ...invoiceData, supplierGstin: value });
    }}
    pattern="^GSTIN[0-9]{7}$"
    placeholder="GSTIN9876543"
    className={`border rounded p-2 w-full ${
      invoiceData.supplierGstin && !validateGSTIN(invoiceData.supplierGstin) 
        ? 'border-red-500' 
        : ''
    }`}
  />
</div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount</label>
              <input
                type="text"
                value={invoiceData.taxAmount.totalAmount}
                onChange={(e) => setInvoiceData({ ...invoiceData, taxAmount: { ...invoiceData.taxAmount, totalAmount: e.target.value } })}
                className="border rounded p-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CGST</label>
              <input
                type="text"
                value={invoiceData.taxAmount.cgst}
                onChange={(e) => setInvoiceData({ ...invoiceData, taxAmount: { ...invoiceData.taxAmount, cgst: e.target.value } })}
                className="border rounded p-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SGST</label>
              <input
                type="text"
                value={invoiceData.taxAmount.sgst}
                onChange={(e) => setInvoiceData({ ...invoiceData, taxAmount: { ...invoiceData.taxAmount, sgst: e.target.value } })}
                className="border rounded p-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IGST</label>
              <input
                type="text"
                value={invoiceData.taxAmount.igst}
                onChange={(e) => setInvoiceData({ ...invoiceData, taxAmount: { ...invoiceData.taxAmount, igst: e.target.value } })}
                className="border rounded p-2 w-full"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-500 text-white rounded p-2"
          >
            Submit Invoice
          </button>
        </Card>
      )}
    </MainLayout>
  );
};
