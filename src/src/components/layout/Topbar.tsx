import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
interface TopbarProps {
  onMenuClick: () => void;
}
export function Topbar({ onMenuClick }: TopbarProps) {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="h-16 bg-white border-b border-fedora/20 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          title="Open navigation menu"
          aria-label="Open navigation menu"
          className="md:hidden p-2 -ml-2 text-fedora hover:text-tuatara rounded-lg hover:bg-concrete">
          
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-tuatara hidden sm:block">
          ACME Institute
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          title="View notifications"
          aria-label="View notifications"
          className="relative p-2 text-fedora hover:text-tuatara rounded-full hover:bg-concrete transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-scarlet rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-fedora/20">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-tuatara">
              {user?.username || 'User'}
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider">
              
              {user?.role || 'Role'}
            </Badge>
          </div>
          <Avatar fallback={user?.username?.charAt(0).toUpperCase() || 'U'} />
        </div>
      </div>
    </header>);

}