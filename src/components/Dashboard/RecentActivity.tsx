import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "success",
    message: "ITC claim processed successfully",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    type: "error",
    message: "Supplier ABC failed GSTR-1 compliance",
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    type: "warning",
    message: "Credit expiring in 15 days",
    timestamp: "1 day ago",
  },
];

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
};

const colorMap = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
};

const RecentActivity = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type as keyof typeof iconMap];
          const color = colorMap[activity.type as keyof typeof colorMap];
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
              <div>
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentActivity;