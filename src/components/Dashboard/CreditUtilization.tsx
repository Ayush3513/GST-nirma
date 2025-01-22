import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Download,
  Filter,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";

interface CreditData {
  name: string;
  available: number;
  utilized: number;
  pending: number;
  blocked: number;
}

interface CreditUtilizationProps {
  data: CreditData[];
  onDataUpdate: (newData: CreditData[]) => void;
}

const CreditUtilization: React.FC<CreditUtilizationProps> = ({
  data,
  onDataUpdate,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [selectedView, setSelectedView] = useState("bar");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<CreditData>({
    name: "CGST",
    available: 0,
    utilized: 0,
    pending: 0,
    blocked: 0,
  });

  // Calculate totals for summary
  const totals = data.reduce(
    (acc, curr) => ({
      available: acc.available + curr.available,
      utilized: acc.utilized + curr.utilized,
      pending: acc.pending + curr.pending,
      blocked: acc.blocked + curr.blocked,
    }),
    { available: 0, utilized: 0, pending: 0, blocked: 0 }
  );

  // Prepare data for pie chart
  const pieData = [
    { name: "Utilized", value: totals.utilized },
    { name: "Available", value: totals.available - totals.utilized },
    { name: "Pending", value: totals.pending },
    { name: "Blocked", value: totals.blocked },
  ];

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  const handleAddData = () => {
    const updatedData = [...data, newEntry];
    onDataUpdate(updatedData);
    setIsDialogOpen(false);
    setNewEntry({
      name: "CGST",
      available: 0,
      utilized: 0,
      pending: 0,
      blocked: 0,
    });
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Credit Utilization</h3>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="lastQuarter">Last Quarter</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Credit Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select
                    value={newEntry.name}
                    onValueChange={(value) =>
                      setNewEntry({ ...newEntry, name: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CGST">CGST</SelectItem>
                      <SelectItem value="SGST">SGST</SelectItem>
                      <SelectItem value="IGST">IGST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Available Amount
                  </label>
                  <input
                    type="number"
                    value={newEntry.available}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        available: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Utilized Amount
                  </label>
                  <input
                    type="number"
                    value={newEntry.utilized}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        utilized: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pending Amount
                  </label>
                  <input
                    type="number"
                    value={newEntry.pending}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        pending: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Blocked Amount
                  </label>
                  <input
                    type="number"
                    value={newEntry.blocked}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        blocked: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <Button onClick={handleAddData} className="w-full">
                  Add Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="current" onClick={() => setSelectedView("bar")}>
            <BarChartIcon className="w-4 h-4 mr-2" />
            Current Status
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            onClick={() => setSelectedView("pie")}
          >
            <PieChartIcon className="w-4 h-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="trends" onClick={() => setSelectedView("line")}>
            <LineChartIcon className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="utilized"
                stackId="a"
                fill="#1E40AF"
                name="Utilized"
              />
              <Bar
                dataKey="pending"
                stackId="a"
                fill="#FBBF24"
                name="Pending"
              />
              <Bar
                dataKey="blocked"
                stackId="a"
                fill="#EF4444"
                name="Blocked"
              />
              <Bar dataKey="available" fill="#93C5FD" name="Available" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="distribution" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="trends" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="utilized"
                stackId="1"
                stroke="#1E40AF"
                fill="#1E40AF"
              />
              <Area
                type="monotone"
                dataKey="available"
                stackId="1"
                stroke="#93C5FD"
                fill="#93C5FD"
              />
              <Area
                type="monotone"
                dataKey="pending"
                stackId="1"
                stroke="#FBBF24"
                fill="#FBBF24"
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CreditUtilization;
