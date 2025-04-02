import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Users,
  LineChart,
  FolderKanban,
  FileText,
  Calendar,
  BarChartHorizontal,
  CircuitBoard,
  Settings,
  HelpCircle,
  FileUp
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  collapsed: boolean;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  collapsed: boolean;
  active: boolean;
}

function SidebarItem({ icon, label, href, collapsed, active }: SidebarItemProps) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          to={href}
          className={cn(
            "flex items-center py-2 px-3 my-1 rounded-md text-sm font-medium transition-colors",
            active
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className={collapsed ? "mx-auto" : "mr-3"}>{icon}</div>
          {!collapsed && <span>{label}</span>}
        </Link>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <TooltipProvider>
      <ScrollArea className="h-full py-4">
        {collapsed ? (
          <div className="flex justify-center py-4">
            <CircuitBoard size={28} />
          </div>
        ) : (
          <div className="px-4 py-4">
            <div className="flex items-center gap-2">
              <CircuitBoard size={24} />
              <h2 className="text-lg font-bold">IntelliSync</h2>
            </div>
          </div>
        )}
        
        <nav className="px-2 mt-4">
          {/* Dashboard */}
          <SidebarItem 
            icon={<BarChartHorizontal size={20} />}
            label="Dashboard"
            href="/"
            collapsed={collapsed}
            active={isActive('/')}
          />
          
          {/* Client Management */}
          <p className={cn(
            "text-xs font-semibold text-muted-foreground mt-6 mb-2", 
            collapsed && "sr-only"
          )}>
            CLIENT MANAGEMENT
          </p>
          {collapsed && <Separator className="my-4" />}
          
          <SidebarItem 
            icon={<Users size={20} />}
            label="Clients"
            href="/clients"
            collapsed={collapsed}
            active={isActive('/clients')}
          />
          
          <SidebarItem 
            icon={<LineChart size={20} />}
            label="Sales Pipeline"
            href="/sales/leads"
            collapsed={collapsed}
            active={isActive('/sales')}
          />
          
          {/* Project Management */}
          <p className={cn(
            "text-xs font-semibold text-muted-foreground mt-6 mb-2", 
            collapsed && "sr-only"
          )}>
            PROJECT MANAGEMENT
          </p>
          {collapsed && <Separator className="my-4" />}
          
          <SidebarItem 
            icon={<FolderKanban size={20} />}
            label="Projects"
            href="/projects"
            collapsed={collapsed}
            active={isActive('/projects')}
          />
          
          <SidebarItem 
            icon={<Calendar size={20} />}
            label="Calendar"
            href="/calendar"
            collapsed={collapsed}
            active={isActive('/calendar')}
          />
          
          {/* Resources */}
          <p className={cn(
            "text-xs font-semibold text-muted-foreground mt-6 mb-2", 
            collapsed && "sr-only"
          )}>
            RESOURCES
          </p>
          {collapsed && <Separator className="my-4" />}
          
          <SidebarItem 
            icon={<FileText size={20} />}
            label="Meeting Notes"
            href="/resources/meeting-notes"
            collapsed={collapsed}
            active={isActive('/resources/meeting-notes')}
          />
          
          <SidebarItem 
            icon={<FileUp size={20} />}
            label="Files"
            href="/resources/files"
            collapsed={collapsed}
            active={isActive('/resources/files')}
          />
          
          {/* System */}
          <p className={cn(
            "text-xs font-semibold text-muted-foreground mt-6 mb-2", 
            collapsed && "sr-only"
          )}>
            SYSTEM
          </p>
          {collapsed && <Separator className="my-4" />}
          
          <SidebarItem 
            icon={<Settings size={20} />}
            label="Settings"
            href="/settings"
            collapsed={collapsed}
            active={isActive('/settings')}
          />
          
          <SidebarItem 
            icon={<HelpCircle size={20} />}
            label="Help & Support"
            href="/help"
            collapsed={collapsed}
            active={isActive('/help')}
          />
        </nav>
      </ScrollArea>
    </TooltipProvider>
  );
}