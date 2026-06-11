import React from 'react';
import { Construction } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
export function Placeholder({ title }: {title: string;}) {
  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <EmptyState
          icon={Construction}
          title={`${title} Coming Soon`}
          description="This module is currently under development and will be available in the next release." />
        
      </Card>
    </div>);

}