import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
}

export function BackButton({ 
  fallbackUrl,
  label = "Back",
  variant = "outline" 
}: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    // If we have a referrer in history, go back to previous page
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
      navigate(-1);
    } else {
      // Otherwise, go to the fallback URL or the parent route
      if (fallbackUrl) {
        navigate(fallbackUrl);
      } else {
        // Get the parent route
        const parentRoute = location.pathname.split('/').slice(0, -1).join('/');
        navigate(parentRoute || '/');
      }
    }
  };

  return (
    <Button variant={variant} onClick={handleGoBack} className="flex items-center">
      <ChevronLeft className="h-4 w-4 mr-1" />
      {label}
    </Button>
  );
}