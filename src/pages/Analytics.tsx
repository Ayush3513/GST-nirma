import React from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ITCClaim = Database['public']['Tables']['itc_claims']['Row'];

const Analytics = () => {
  const { data: itcData, isLoading } = useQuery({
    queryKey: ['itc-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itc_claims')
        .select('*')
        .order('claim_date', { ascending: true });
      
      if (error) throw error;
      return data as ITCClaim[];
    }
  });

  const chartConfig = {
    claimed: {
      label: "Claimed ITC",
      theme: {
        light: "#2563eb",
        dark: "#3b82f6",
      },
    },
    eligible: {
      label: "Eligible ITC",
      theme: {
        light: "#16a34a",
        dark: "#22c55e",
      },
    },
  };

  const mockData = [
    { month: 'Jan', claimed: 4000, eligible: 4400 },
    { month: 'Feb', claimed: 3000, eligible: 3200 },
    { month: 'Mar', claimed: 2000, eligible: 2800 },
    { month: 'Apr', claimed: 2780, eligible: 3000 },
    { month: 'May', claimed: 1890, eligible: 2100 },
    { month: 'Jun', claimed: 2390, eligible: 2500 },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total ITC Claimed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹16,450</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eligible ITC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹18,000</div>
              <p className="text-xs text-muted-foreground">+8.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reconciliation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91.4%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>ITC Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={mockData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar
                    dataKey="claimed"
                    name="claimed"
                    fill="var(--color-claimed)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="eligible"
                    name="eligible"
                    fill="var(--color-eligible)"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartTooltip />
                  <ChartLegend />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Analytics;