import React, { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import StatCard from "@/components/Layout/Dashboard/StatCard";
import RecentActivity from "@/components/Layout/Dashboard/RecentActivity";
import CreditUtilization from "@/components/Layout/Dashboard/CreditUtilization";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Brain,
  Calculator,
  FileCheck,
  UserCheck,
  PieChart,
  Bell,
  BarChart,
  Smartphone,
  Globe,
  Wifi,
  Moon,
  Star,
  Workflow,
  MessageSquare,
  History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FeatureCard = ({
  title,
  status,
  icon: Icon,
}: {
  title: string;
  status: "live" | "coming-soon";
  icon: React.ElementType;
}) => (
  <Card className="p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary" />
      <span className="font-medium">{title}</span>
    </div>
    <Badge
      className="whitespace-nowrap"
      variant={status === "live" ? "default" : "secondary"}
    >
      {status === "live" ? "Live" : "Coming Soon"}
    </Badge>
  </Card>
);

function Index() {
  const [creditData, setCreditData] = useState([]);
  const [stats, setStats] = useState({
    totalITC: 0,
    utilizedITC: 0,
    pendingClaims: 0,
    complianceScore: 95,
  });

  useEffect(() => {
    // Fetch data from Supabase
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('credit_utilization')
        .select('cgst, sgst, igst');

      if (error) {
        console.error("Error fetching credit data:", error);
      } else if (Array.isArray(data)) {
        const formattedData = [
          {
            name: "CGST",
            available: data.reduce((sum, item) => sum + item.cgst, 0),
            utilized: 0, // Assuming utilized data is not available in the schema
            pending: 0, // Assuming pending data is not available in the schema
            blocked: 0, // Assuming blocked data is not available in the schema
          },
          {
            name: "SGST",
            available: data.reduce((sum, item) => sum + item.sgst, 0),
            utilized: 0, // Assuming utilized data is not available in the schema
            pending: 0, // Assuming pending data is not available in the schema
            blocked: 0, // Assuming blocked data is not available in the schema
          },
          {
            name: "IGST",
            available: data.reduce((sum, item) => sum + item.igst, 0),
            utilized: 0, // Assuming utilized data is not available in the schema
            pending: 0, // Assuming pending data is not available in the schema
            blocked: 0, // Assuming blocked data is not available in the schema
          },
        ];
        setCreditData(formattedData);
        setStats({
          totalITC: formattedData.reduce((sum, item) => sum + item.available, 0),
          utilizedITC: 0, // Assuming utilized data is not available in the schema
          pendingClaims: 0, // Assuming pending data is not available in the schema
          complianceScore: 95, // Keep the same compliance score
        });
      } else {
        console.error("Fetched data is not an array:", data);
      }
    };

    fetchData();
  }, []);

  const features: {
    title: string;
    icon: React.ElementType;
    status: "live" | "coming-soon";
  }[] = [
    { title: "Invoice Upload/Integration", icon: Upload, status: "live" },
    {
      title: "AI-Driven Invoice Data Extraction",
      icon: Brain,
      status: "live",
    },
    { title: "ITC Eligibility Tracker", icon: Calculator, status: "live" },
    { title: "Reconciliation Management", icon: FileCheck, status: "live" },
    {
      title: "Supplier Compliance Monitoring",
      icon: UserCheck,
      status: "coming-soon",
    },
    {
      title: "Credit Utilization Optimization",
      icon: PieChart,
      status: "live",
    },
    { title: "Intelligent Alerts", icon: Bell, status: "coming-soon" },
    { title: "Analytics & Reporting", icon: BarChart, status: "live" },
    { title: "Mobile-First Design", icon: Smartphone, status: "live" },
    { title: "Multilingual Support", icon: Globe, status: "coming-soon" },
    { title: "Offline Mode", icon: Wifi, status: "coming-soon" },
    { title: "Dark Mode", icon: Moon, status: "coming-soon" },
    { title: "Supplier Compliance Rating", icon: Star, status: "coming-soon" },
    {
      title: "Customizable Compliance Workflows",
      icon: Workflow,
      status: "coming-soon",
    },
    {
      title: "AI Chatbot for Supplier Compliance",
      icon: MessageSquare,
      status: "coming-soon",
    },
    { title: "Timeline with Alerts", icon: History, status: "coming-soon" },
  ];

  const handleCreditDataUpdate = (newData: typeof creditData) => {
    setCreditData(newData);
    // Update stats based on new credit data
    setStats({
      totalITC: newData.reduce((sum, item) => sum + item.available, 0),
      utilizedITC: newData.reduce((sum, item) => sum + item.utilized, 0),
      pendingClaims: newData.reduce((sum, item) => sum + item.pending, 0),
      complianceScore: stats.complianceScore, // Keep the same compliance score
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, Priya</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total ITC Available"
            value={`₹${stats.totalITC.toLocaleString()}`}
            icon={IndianRupee}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="ITC Utilized"
            value={`₹${stats.utilizedITC.toLocaleString()}`}
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Claims"
            value={`₹${stats.pendingClaims.toLocaleString()}`}
            icon={AlertTriangle}
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="Compliance Score"
            value={`${stats.complianceScore}%`}
            icon={CheckCircle2}
            trend={{ value: 2, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CreditUtilization
              data={creditData}
              onDataUpdate={handleCreditDataUpdate}
            />
          </div>
          <div className="w-full">
            <RecentActivity />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features & Roadmap</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                status={feature.status}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Index;
