import React from "react";
import MainLayout from "@/components/Layout/MainLayout";
import StatCard from "@/components/Dashboard/StatCard";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import CreditUtilization from "@/components/Dashboard/CreditUtilization";
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
  History
} from "lucide-react";

const FeatureCard = ({ title, status, icon: Icon }: { 
  title: string; 
  status: "live" | "coming-soon"; 
  icon: React.ElementType;
}) => (
  <Card className="p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary" />
      <span className="font-medium">{title}</span>
    </div>
    <Badge variant={status === "live" ? "default" : "secondary"}>
      {status === "live" ? "Live" : "Coming Soon"}
    </Badge>
  </Card>
);

const Index = () => {
  const features: Array<{
    title: string;
    icon: React.ElementType;
    status: "live" | "coming-soon";
  }> = [
    { title: "Invoice Upload/Integration", icon: Upload, status: "live" },
    { title: "AI-Driven Invoice Data Extraction", icon: Brain, status: "coming-soon" },
    { title: "ITC Eligibility Tracker", icon: Calculator, status: "live" },
    { title: "Reconciliation Management", icon: FileCheck, status: "live" },
    { title: "Supplier Compliance Monitoring", icon: UserCheck, status: "coming-soon" },
    { title: "Credit Utilization Optimization", icon: PieChart, status: "live" },
    { title: "Intelligent Alerts", icon: Bell, status: "coming-soon" },
    { title: "Analytics & Reporting", icon: BarChart, status: "live" },
    { title: "Mobile-First Design", icon: Smartphone, status: "live" },
    { title: "Multilingual Support", icon: Globe, status: "coming-soon" },
    { title: "Offline Mode", icon: Wifi, status: "coming-soon" },
    { title: "Dark Mode", icon: Moon, status: "coming-soon" },
    { title: "Supplier Compliance Rating", icon: Star, status: "coming-soon" },
    { title: "Customizable Compliance Workflows", icon: Workflow, status: "coming-soon" },
    { title: "AI Chatbot for Supplier Compliance", icon: MessageSquare, status: "coming-soon" },
    { title: "Timeline with Alerts", icon: History, status: "coming-soon" }
  ];

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
            value="₹5,00,000"
            icon={IndianRupee}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="ITC Utilized"
            value="₹4,00,000"
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Claims"
            value="₹50,000"
            icon={AlertTriangle}
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="Compliance Score"
            value="95%"
            icon={CheckCircle2}
            trend={{ value: 2, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CreditUtilization />
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
};

export default Index;