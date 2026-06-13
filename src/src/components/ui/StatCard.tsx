import { Card, CardContent } from './Card';
import { cn } from '../../utils/cn';
import { type LucideIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fedora mb-1">{title}</p>
            <h4 className="text-3xl font-bold text-tuatara">{value}</h4>
            {trend &&
            <p
              className={cn(
                'text-xs mt-2 font-medium flex items-center gap-1',
                trend.isPositive ? 'text-green-600' : 'text-scarlet'
              )}>
              
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
                <span className="text-fedora font-normal ml-1">
                  from last month
                </span>
              </p>
            }
          </div>
          <div className="h-12 w-12 rounded-xl bg-scarlet/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-scarlet" />
          </div>
        </div>
      </CardContent>
    </Card>);

}