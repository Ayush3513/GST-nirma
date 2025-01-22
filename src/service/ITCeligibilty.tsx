import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  invoice_number: string;
  supplier_gstin: string;
  cgst: number;
  sgst: number;
  igst: number;
}

export const checkITCEligibility = async (invoice: Invoice) => {
  if (!invoice?.invoice_number || !invoice?.supplier_gstin) {
    throw new Error('Invalid invoice data provided');
  }

  try {
    const { data: existingInvoice, error: existingInvoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_number', invoice.invoice_number)
      .maybeSingle();

    if (existingInvoiceError) throw new Error('Error checking existing invoice');

    // Allow invoices with the same number but different supplier GSTINs
    if (existingInvoice && existingInvoice.supplier_gstin === invoice.supplier_gstin) {
      throw new Error('Invoice with the same number and supplier GSTIN already exists');
    }

    const { data: newInvoice, error: newInvoiceError } = await supabase
      .from('invoices')
      .insert([invoice]);

    if (newInvoiceError) throw new Error('Error adding new invoice');

    const { data: gstr2b, error: gstr2bError } = await supabase
      .from('gstr_2b')
      .select('*')
      .eq('invoice_number', invoice.invoice_number)
      .eq('supplier_gstin', invoice.supplier_gstin)
      .maybeSingle();

    if (gstr2bError) throw new Error('Error fetching GSTR-2B data');

    const isEligible = !!gstr2b;
    const verificationStatus = gstr2b ? 'VERIFIED' : 'NOT_FOUND';

    return {
      isEligible,
      verificationStatus,
      eligibleAmount: isEligible ? 
        Number(invoice.cgst) + Number(invoice.sgst) + Number(invoice.igst) : 0,
      reasons: isEligible ? [] : ['Invoice not found in GSTR-2B']
    };
  } catch (error) {
    console.error('ITC Eligibility Error:', error);
    throw error;
  }
};