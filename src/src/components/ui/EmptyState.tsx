import { cn } from '../../utils/cn';
import { type LucideIcon } from 'lucide-react';
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        className
      )}>
      
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-fedora/10 mb-6">
        <Icon className="h-10 w-10 text-fedora" />
      </div>
      <h3 className="text-xl font-semibold text-tuatara mb-2">{title}</h3>
      <p className="text-sm text-fedora max-w-sm">{description}</p>
    </div>);

}