import React from 'react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles, Download } from 'lucide-react';
import { TabType } from './BottomNav';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenProfile: () => void;
  onOpenInstallApp?: () => void;
  activeTab: TabType;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenScanner, 
  onOpenProfile, 
  onOpenInstallApp 
}) => {
  const { userProfile, currentUser } = useAuth();
  const { theme, toggleTheme, primaryColor } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <Logo size="sm" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Smart Scan Quick Launcher */}
          <button
            type="button"
            id="btn-header-scan-ocr"
            onClick={onOpenScanner}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-full text-xs font-semibold border transition-all active:scale-95 cursor-pointer shadow-2xs"
            style={{
              backgroundColor: `${primaryColor}14`,
              color: primaryColor,
              borderColor: `${primaryColor}35`,
            }}
            title="Scan Struk dengan AI"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: primaryColor }} />
            <span className="hidden xs:inline">Scan Struk</span>
          </button>

          {/* Install App Quick Launcher */}
          {onOpenInstallApp && (
            <button
              type="button"
              id="btn-header-install-app"
              onClick={onOpenInstallApp}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Pasang / Jadikan Paket Aplikasi"
            >
              <Download className="w-4 h-4 text-emerald-500" />
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            id="btn-toggle-theme"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            id="btn-header-profile"
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full border overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:ring-2 transition-all cursor-pointer shrink-0"
            style={{
              borderColor: `${primaryColor}40`,
            }}
          >
            {userProfile?.photoURL || currentUser?.photoURL ? (
              <img
                src={userProfile?.photoURL || currentUser?.photoURL || ''}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full text-white font-bold text-xs flex items-center justify-center uppercase"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
                }}
              >
                {(userProfile?.displayName || currentUser?.displayName || currentUser?.email || 'U')[0]}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
