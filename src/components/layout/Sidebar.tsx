
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleConfig, getRoleDisplayName } from '@/config/roleConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();
  
  if (!user) {
    return null;
  }

  const roleConfig = getRoleConfig(user.role);
  const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  // Use role-specific navigation items or fallback to legacy items
  const navigationItems = roleConfig?.navigationItems || [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'reminders', label: 'Cow Reminders', icon: '⏰', path: '/reminders' },
    { id: 'sync-methods', label: 'Sync Methods', icon: '🔬', path: '/sync-methods' },
    { id: 'analytics', label: 'Analytics', icon: '📈', path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'manager': return 'bg-blue-500';
      case 'doctor': return 'bg-green-500';
      case 'technician': return 'bg-purple-500';
      case 'helper': return 'bg-yellow-500';
      case 'office': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-gray-900">CattleSync Pro</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${getRoleColor(user.role)} text-white text-xs`}>
            {getRoleDisplayName(user.role)}
          </Badge>
          <span className="text-xs text-gray-500">Portal</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            // Handle nested navigation items
            if (item.children) {
              return (
                <li key={item.id} className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-3">
                    {item.label}
                  </div>
                  <ul className="space-y-1">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => onSectionChange(child.id)}
                          className={cn(
                            "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors duration-200 text-sm",
                            activeSection === child.id
                              ? "bg-primary text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <span>{child.icon}</span>
                          <span className="font-medium">{child.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors duration-200",
                    activeSection === item.id
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Menu */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center space-x-3 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className={`${getRoleColor(user.role)} text-white text-xs`}>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" side="top">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                <Badge className={`${getRoleColor(user.role)} text-white text-xs mt-1 w-fit`}>
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {user.lastLogin && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Last login: {new Date(user.lastLogin).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
