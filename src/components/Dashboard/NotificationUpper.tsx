import React, { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New message",
      message: "You have a new message from John Doe",
      read: false,
      timestamp: new Date(),
    },
    {
      id: "2",
      title: "Payment received",
      message: "You received a payment of $50.00",
      read: false,
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "3",
      title: "New follower",
      message: "Jane Smith started following you",
      read: true,
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: "4",
      title: "New follower",
      message: "Jane Smith started following you",
      read: true,
      timestamp: new Date(Date.now() - 86400000),
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 mr-16 shadow-lg">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem>No notifications</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start p-2"
            >
              <div className="flex justify-between w-full">
                <span className="font-medium">{notification.title}</span>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(notification.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <div className="flex justify-between w-full mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                  onClick={() => markAsRead(notification.id)}
                  disabled={notification.read}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {notification.read ? "Read" : "Mark as read"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
