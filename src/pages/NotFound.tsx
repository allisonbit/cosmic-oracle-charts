import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, TrendingUp, BarChart3, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen cosmic-bg flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Cosmic 404 */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-display font-bold glow-text">404</h1>
          <div className="absolute inset-0 blur-3xl bg-primary/20 -z-10" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
          Lost in the <span className="text-gradient-cosmic">Crypto Cosmos</span>
        </h2>
        
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved to a different dimension.
        </p>
        
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Button asChild variant="default" className="gap-2 w-full sm:w-auto">
            <Link to="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
            <Link to="/predictions">
              <TrendingUp className="w-4 h-4" />
              Price Predictions
            </Link>
          </Button>
        </div>
        
        {/* Helpful Links */}
        <div className="holo-card p-6 text-left">
          <h3 className="font-display font-bold text-sm mb-4 text-center">Popular Destinations</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              Dashboard
            </Link>
            <Link 
              to="/explorer" 
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
            >
              <Search className="w-4 h-4 text-primary" />
              Explorer
            </Link>
            <Link 
              to="/sentiment" 
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
            >
              <TrendingUp className="w-4 h-4 text-primary" />
              Sentiment
            </Link>
            <Link 
              to="/factory" 
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              Factory
            </Link>
          </div>
        </div>
        
        {/* Back button */}
        <button 
          onClick={() => window.history.back()}
          className="mt-6 text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-3 h-3" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;