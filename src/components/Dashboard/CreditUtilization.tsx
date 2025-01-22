import React from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "CGST",
    available: 150000,
    utilized: 120000,
  },
  {
    name: "SGST",
    available: 150000,
    utilized: 100000,
  },
  {
    name: "IGST",
    available: 200000,
    utilized: 180000,
  },
];

const CreditUtilization = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Credit Utilization</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="available" fill="#93C5FD" name="Available" />
            <Bar dataKey="utilized" fill="#1E40AF" name="Utilized" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CreditUtilization;