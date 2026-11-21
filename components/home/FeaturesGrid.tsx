import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * Simple 4‑item feature grid used on the home page.
 * Each feature receives an icon, title and description.
 */
interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeaturesGrid({ features }: { features: Feature[] }) {
  return (
    <section className="mx-auto max-w-7xl py-12 sm:px-8 lg:py-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Card key={i} className="flex flex-col p-4 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center space-y-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {f.icon}
              </div>
              <CardTitle className="text-center text-lg font-semibold text-foreground">
                {f.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              {f.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
