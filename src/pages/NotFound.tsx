import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mountain } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex items-center gap-2 mb-8">
        <Mountain className="h-10 w-10 text-primary" />
        <span className="text-3xl font-bold text-primary">FarmLink</span>
      </div>
      <h1 className="text-9xl font-extrabold text-primary/10">404</h1>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h2>
      <p className="mt-4 text-muted-foreground">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div className="mt-10">
        <Link to="/">
          <Button size="lg">Go back home</Button>
        </Link>
      </div>
    </div>
  );
}
