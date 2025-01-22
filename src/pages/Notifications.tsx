import React from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  date: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "ITC Claim Approved",
    message: "Your ITC claim for INV001 has been approved.",
    type: "success",
    date: "2024-02-15",
    read: false
  },
  {
    id: "2",
    title: "Reconciliation Required",
    message: "3 transactions need reconciliation.",
    type: "warning",
    date: "2024-02-14",
    read: false
  },
  {
    id: "3",
    title: "New Feature Available",
    message: "Check out our new reconciliation dashboard.",
    type: "info",
    date: "2024-02-13",
    read: true
  }
];

const Notifications = () => {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <p className="text-gray-600">Stay updated with important alerts</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Bell className="w-4 h-4" />
            Mark all as read
          </Button>
        </div>

        <div className="space-y-4">
          {mockNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 ${notification.read ? "bg-gray-50" : "bg-white"}`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{notification.title}</h3>
                    <span className="text-sm text-gray-500">{notification.date}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;