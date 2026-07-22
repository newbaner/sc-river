import { Search, RefreshCw, Droplets, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  lastUpdated: string;
  onRefresh: () => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({ searchQuery, onSearchChange, lastUpdated, onRefresh, isLoading, theme, onToggleTheme }: HeaderProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-[#141824] border-b border-slate-200 dark:border-[#2D3548] flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-50 transition-colors duration-300">
      {/* 左侧：Logo 和 标题 */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#3B82F6]/15 flex items-center justify-center flex-shrink-0">
          <Droplets className="w-5 h-5 text-blue-500 dark:text-[#3B82F6]" />
        </div>
        <div className="hidden sm:block min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight truncate">
            四川省河道水情实时监控
          </h1>
        </div>
        <div className="sm:hidden">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">四川水情</h1>
        </div>
      </div>

      {/* 中间：搜索框 */}
      <div className="flex-1 max-w-md mx-4">
        <div
          className={`
            relative flex items-center h-10 rounded-lg transition-all duration-200
            ${isFocused
              ? 'bg-white dark:bg-[#1E2330] ring-2 ring-blue-400/50 dark:ring-[#3B82F6]/50 shadow-[0_0_12px_rgba(59,130,246,0.12)]'
              : 'bg-slate-100 dark:bg-[#1E2330] ring-1 ring-slate-200 dark:ring-[#2D3548]'
            }
          `}
        >
          <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] ml-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="搜索水文站名称..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#94A3B8] px-2 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="mr-2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-white text-xs transition-colors"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* 右侧：主题切换 + 刷新按钮 + 时间 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1E2330] border border-slate-200 dark:border-[#2D3548] flex items-center justify-center
                     hover:border-blue-400/50 dark:hover:border-[#3B82F6]/50 hover:bg-blue-50 dark:hover:bg-[#3B82F6]/10 transition-all duration-200"
          title={theme === 'light' ? '切换到夜间模式' : '切换到白天模式'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        <span className="hidden md:block text-xs text-slate-500 dark:text-[#94A3B8] ml-1">
          更新于 {lastUpdated}
        </span>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1E2330] border border-slate-200 dark:border-[#2D3548] flex items-center justify-center
                     hover:border-blue-400/50 dark:hover:border-[#3B82F6]/50 hover:bg-blue-50 dark:hover:bg-[#3B82F6]/10 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          title="刷新数据"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 dark:text-[#94A3B8] ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
