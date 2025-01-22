import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notifications } from "../Dashboard/NotificationUpper";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

const Header = ({ toggleMobileSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      console.log(user);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden scale-125"
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-10 w-10" />
          </Button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Notifications />
          {user && (
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-800 font-medium">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <Button onClick={handleLogout} className="text-white">
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
