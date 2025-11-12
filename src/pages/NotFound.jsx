import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center glass-effect p-12 rounded-2xl max-w-lg animate-fade-in">
        <h1 className="mb-4 text-8xl font-bold text-gradient">404</h1>
        <h2 className="mb-4 text-3xl font-bold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Home size={20} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
