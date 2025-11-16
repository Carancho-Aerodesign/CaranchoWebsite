import { useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { LogIn, LogOut, Menu, X } from 'lucide-react';

import type { AppPage } from '../../types';

const NAV_LINKS: Array<{ key: AppPage; label: string; requiresAuth?: boolean }> = [
  { key: 'home', label: 'Início' },
  { key: 'about', label: 'Sobre Nós' },
  { key: 'projects', label: 'Projetos' },
  { key: 'admin', label: 'Painel Admin', requiresAuth: true },
];

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  user: User | null;
  onLogout: () => Promise<void> | void;
}

export function Navbar({ currentPage, onNavigate, user, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page: AppPage) => {
    setIsMenuOpen(false);
    onNavigate(page);
  };

  const handleLogout = async () => {
    await onLogout();
    handleNavClick('home');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
            <img className="h-10" src="./logoWithLabel.png" alt="Logo Carancho Aerodesign" loading="lazy" decoding="async" />
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {NAV_LINKS.filter((link) => !link.requiresAuth || user).map((link) => (
                <NavItem
                  key={link.key}
                  active={currentPage === link.key}
                  onClick={() => handleNavClick(link.key)}
                >
                  {link.label}
                </NavItem>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Olá, {user.email?.split('@')[0]}</span>
                  <LogoutButton onClick={handleLogout} />
                </div>
              ) : (
                <LoginButton onClick={() => handleNavClick('login')} />
              )}
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_LINKS.filter((link) => !link.requiresAuth || user).map((link) => (
              <NavItemMobile
                key={link.key}
                active={currentPage === link.key}
                onClick={() => handleNavClick(link.key)}
              >
                {link.label}
              </NavItemMobile>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            {user ? (
              <div className="flex flex-col items-start gap-4">
                <span className="text-sm text-gray-600 px-3">Olá, {user.email?.split('@')[0]}</span>
                <LogoutButton onClick={handleLogout} fullWidth />
              </div>
            ) : (
              <LoginButton onClick={() => handleNavClick('login')} fullWidth />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

interface NavItemProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ children, active, onClick }: NavItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
      active ? 'bg-[#d4982c] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

const NavItemMobile = ({ children, active, onClick }: NavItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
      active ? 'bg-[#d4982c] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

interface AuthButtonProps {
  onClick: () => void;
  fullWidth?: boolean;
}

const LoginButton = ({ onClick, fullWidth = false }: AuthButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`bg-[#d4982c] hover:bg-[#b58426] text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/50 ${
      fullWidth ? 'w-full' : ''
    }`}
  >
    <LogIn className="h-5 w-5 mr-2" />
    Login
  </button>
);

const LogoutButton = ({ onClick, fullWidth = false }: AuthButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/50 ${
      fullWidth ? 'w-full' : ''
    }`}
  >
    <LogOut className="h-5 w-5 mr-2" />
    Logout
  </button>
);
