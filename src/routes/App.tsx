import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <main className="min-h-screen container flex items-center">
      <Card className="mx-auto w-full max-w-xl">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-3xl font-bold">SlidePost</h1>
          <p>Create LinkedIn carousels in minutes — not hours.</p>
          <div className="flex gap-3">
            <Button asChild><Link to="/editor">Open Editor</Link></Button>
            <Button variant="outline" asChild><Link to="/templates">Browse Templates</Link></Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
