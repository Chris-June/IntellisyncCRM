import { ReactNode } from "react";
import { BackButton } from "@/components/ui/back-button";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  showBackButton?: boolean;
  backButtonUrl?: string;
}

export function PageHeader({ 
  title, 
  description, 
  children, 
  showBackButton = false,
  backButtonUrl
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <BackButton fallbackUrl={backButtonUrl} />
          )}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}