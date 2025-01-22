import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Row'];

export const reconcileInvoice = async (invoice: Invoice): Promise<string> => {
  try {
    // Check GSTR-2B matching
    const { data: gstr2b, error: gstr2bError } = await supabase
      .from('gstr_2b')
      .select('*')
      .eq('invoice_number', invoice.invoice_number)
      .eq('supplier_gstin', invoice.supplier_gstin)
      .maybeSingle();

    if (gstr2bError) throw new Error('Error fetching GSTR-2B data');

    let reconciliationStatus = 'UNMATCHED';

    if (gstr2b) {
      const isFullMatch = 
        Number(gstr2b.total_amount) === Number(invoice.total_amount) &&
        gstr2b.invoice_date === invoice.invoice_date;

      reconciliationStatus = isFullMatch ? 'MATCHED' : 'PARTIAL';

      // Update invoice status
      await supabase
        .from('invoices')
        .update({ 
          reconciliation_status: reconciliationStatus,
          itc_eligible: isFullMatch,
          updated_at: new Date().toISOString()
        })
        .eq('invoice_number', invoice.invoice_number);
    }

    return reconciliationStatus;
  } catch (error) {
    console.error('Reconciliation Error:', error);
    throw error;
  }
};