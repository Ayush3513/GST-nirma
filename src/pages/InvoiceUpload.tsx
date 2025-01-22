import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/Layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { checkITCEligibility } from "@/service/ITCeligibilty";
import { reconcileInvoice } from "@/service/reconcile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const invoiceSchema = z.object({
  invoiceNumber: z.string().nonempty("Invoice number is required"),
  invoiceDate: z.string().nonempty("Invoice date is required"),
  buyerGstin: z.string().regex(/^GSTIN[0-9]{7}$/, "Invalid GSTIN format"),
  supplierGstin: z.string().regex(/^GSTIN[0-9]{7}$/, "Invalid GSTIN format"),
  taxAmount: z.object({
    cgst: z.number().min(0, "CGST must be a positive number"),
    sgst: z.number().min(0, "SGST must be a positive number"),
    igst: z.number().min(0, "IGST must be a positive number"),
    totalAmount: z.number().min(0, "Total amount must be a positive number"),
  }),
});

export default function InvoiceUpload() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
  });

  // Function to upload the file and process it using Mindee API
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("document", file);

        // Step 1: Make the API request to upload the document
        const response = await fetch(
          "https://api.mindee.net/v1/products/nirma/invoicy/v1/predict_async", // Correct URL for async prediction
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Token 7d0ed7d071f75355b9d289e1b9969cdd", // Replace with your actual API key
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
          `https://api.mindee.net/v1/products/nirma/invoicy/v1/documents/queue/${jobId}`,
          {
            method: "GET",
            headers: {
              Authorization: "Token 7d0ed7d071f75355b9d289e1b9969cdd", // Replace with your actual API key
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
         `https://api.mindee.net/v1/products/nirma/invoicy/v1/documents/queue/${jobId}`,
         {
           method: "GET",
           headers: {
             Authorization: "Token 7d0ed7d071f75355b9d289e1b9969cdd", // Replace with your actual API key
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

         // Set form values
         setValue("invoiceNumber", importantData.invoicenumber?.value || "");
         setValue("invoiceDate", importantData.invoice_date?.value || "");
         setValue("buyerGstin", importantData.buyergstin?.value || "");
         setValue("supplierGstin", importantData.suppliergstin?.value || "");
         setValue("taxAmount.cgst", parseFloat(importantData.taxamount?.cgst) || 0);
         setValue("taxAmount.sgst", parseFloat(importantData.taxamount?.sgst) || 0);
         setValue("taxAmount.igst", parseFloat(importantData.taxamount?.igst) || 0);
         setValue("taxAmount.totalAmount", parseFloat(importantData.taxamount?.total_amount) || 0);

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

  const onSubmit = async (data: any) => {
    try {
      // Step 2: First save invoice to database
      const { data: savedInvoice, error: insertError } = await supabase
        .from('invoices')
        .insert([
          {
            id: crypto.randomUUID(),
            invoice_number: data.invoiceNumber,
            invoice_date: data.invoiceDate,
            buyer_gstin: data.buyerGstin.toUpperCase(),
            supplier_gstin: data.supplierGstin.toUpperCase(),
            cgst: data.taxAmount.cgst || 0,
            sgst: data.taxAmount.sgst || 0,
            igst: data.taxAmount.igst || 0,
            total_amount: data.taxAmount.totalAmount || 0,
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
          `Amount: ₹${eligibilityResult.eligibleAmount}\n` +
          `Reason: ${eligibilityResult.reason || 'N/A'}`,
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Number</label>
                <input
                  type="text"
                  {...register("invoiceNumber")}
                  className="border rounded p-2 w-full"
                />
                {errors.invoiceNumber && <p className="text-red-500 text-xs">{errors.invoiceNumber.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Date</label>
                <input
                  type="date"
                  {...register("invoiceDate")}
                  className="border rounded p-2 w-full"
                />
                {errors.invoiceDate && <p className="text-red-500 text-xs">{errors.invoiceDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Buyer GSTIN</label>
                <input
                  type="text"
                  {...register("buyerGstin")}
                  className="border rounded p-2 w-full"
                />
                {errors.buyerGstin && <p className="text-red-500 text-xs">{errors.buyerGstin.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier GSTIN</label>
                <input
                  type="text"
                  {...register("supplierGstin")}
                  className="border rounded p-2 w-full"
                />
                {errors.supplierGstin && <p className="text-red-500 text-xs">{errors.supplierGstin.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Amount</label>
                <input
                  type="number"
                  {...register("taxAmount.totalAmount")}
                  className="border rounded p-2 w-full"
                />
                {errors.taxAmount?.totalAmount && <p className="text-red-500 text-xs">{errors.taxAmount.totalAmount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CGST</label>
                <input
                  type="number"
                  {...register("taxAmount.cgst")}
                  className="border rounded p-2 w-full"
                />
                {errors.taxAmount?.cgst && <p className="text-red-500 text-xs">{errors.taxAmount.cgst.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SGST</label>
                <input
                  type="number"
                  {...register("taxAmount.sgst")}
                  className="border rounded p-2 w-full"
                />
                {errors.taxAmount?.sgst && <p className="text-red-500 text-xs">{errors.taxAmount.sgst.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IGST</label>
                <input
                  type="number"
                  {...register("taxAmount.igst")}
                  className="border rounded p-2 w-full"
                />
                {errors.taxAmount?.igst && <p className="text-red-500 text-xs">{errors.taxAmount.igst.message}</p>}
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white rounded p-2"
            >
              Submit Invoice
            </button>
          </form>
        </Card>
      )}
    </MainLayout>
  );
};
