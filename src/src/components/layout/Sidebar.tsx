import { NavLink } from 'react-router-dom';
import { LogOut, X, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}
interface SidebarProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}
export function Sidebar({ items, isOpen, onClose }: SidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  return (
    <>
      {/* Mobile overlay */}
      {isOpen &&
      <div
        className="fixed inset-0 z-40 bg-tuatara/50 md:hidden"
        onClick={onClose} />

      }

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-fedora/20 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
        
        <div className="h-16 flex items-center justify-between px-6 border-b border-fedora/10">
          <img
            src="/ACME_logo.png"
            alt="ACME Logo"
            className="h-8 object-contain" />
          
          <button
            onClick={onClose}
            title="Close navigation menu"
            aria-label="Close navigation menu"
            className="md:hidden text-fedora hover:text-tuatara">
            
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          {items.map((item) =>
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => onClose()}
            className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group',
              isActive ?
              'text-scarlet bg-scarlet/5' :
              'text-fedora hover:text-tuatara hover:bg-concrete'
            )
            }>
            
              {({ isActive }) =>
            <>
                  {isActive &&
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-scarlet rounded-r-full" />
              }
                  <item.icon
                className={cn(
                  'h-5 w-5',
                  isActive ?
                  'text-scarlet' :
                  'text-fedora group-hover:text-tuatara'
                )} />
              
                  {item.title}
                </>
            }
            </NavLink>
          )}
        </div>

        <div className="p-4 border-t border-fedora/10">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-fedora hover:text-scarlet hover:bg-scarlet/5 transition-colors">
            
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>);

}