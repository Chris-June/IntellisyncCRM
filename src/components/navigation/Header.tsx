import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircuitBoard, Menu, Bell, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';

// Define types for better type safety
interface UserMetadata {
  avatar_url?: string;
  full_name?: string;
  [key: string]: string | undefined;
}

interface User {
  id: string;
  email: string;
  name?: string;
  user_metadata?: UserMetadata;
}

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface HeaderProps {
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  sidebarOpen: boolean;
  user: User | null;
}

export function Header({ toggleSidebar, toggleMobileSidebar, sidebarOpen, user }: HeaderProps) {
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Placeholder for actual notification fetching logic
        // Replace with actual API call to fetch notifications
        const mockNotifications: Notification[] = [
          { 
            id: '1', 
            message: 'New meeting scheduled', 
            timestamp: new Date(), 
            read: false 
          },
          { 
            id: '2', 
            message: 'Action item due soon', 
            timestamp: new Date(), 
            read: false 
          }
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notifications as read
  const handleNotificationClick = (notificationId: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    );
    
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user?.email) return '';
    return user.email.substring(0, 2).toUpperCase();
  };

  // Get avatar URL with fallback
  const getAvatarUrl = (): string => {
    return user?.user_metadata?.avatar_url || '';
  };
  
  return (
    <header className="h-16 border-b bg-card flex items-center px-4 sticky top-0 z-10">
      <div className="flex items-center w-full gap-4">
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="hidden md:flex"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <CircuitBoard className={sidebarOpen ? "hidden md:block h-6 w-6" : "h-6 w-6"} />
          <span className={sidebarOpen ? "hidden md:block font-bold" : "font-bold"}>
            IntelliSync CMS
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <DropdownMenuItem key={index} onClick={() => handleNotificationClick(notification.id)}>
                    {notification.message}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No new notifications
                </div>
              )}
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center">
                    <Link to="/notifications" className="w-full text-center">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl()} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <Link to="/profile" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <Link to="/settings" className="w-full">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}