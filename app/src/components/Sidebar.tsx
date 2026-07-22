import { Filter, ChevronRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  rivers: string[];
  selectedRiver: string;
  onSelectRiver: (river: string) => void;
  stationCount: number;
  filteredCount: number;
}

export default function Sidebar({ rivers, selectedRiver, onSelectRiver, stationCount, filteredCount }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-500 dark:text-[#3B82F6]" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">流域筛选</span>
        </div>
        <span className="text-xs text-slate-500 dark:text-[#94A3B8]">{filteredCount}/{stationCount}站</span>
      </div>

      <div className="space-y-1">
        <button
          onClick={() => { onSelectRiver('全部'); setMobileOpen(false); }}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm
            transition-all duration-200 group
            ${selectedRiver === '全部'
              ? 'bg-blue-50 dark:bg-[#3B82F6]/15 text-blue-700 dark:text-white'
              : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E2330] hover:text-slate-900 dark:hover:text-white'
            }
          `}
        >
          <span className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedRiver === '全部' ? 'bg-blue-500 dark:bg-[#3B82F6]' : 'bg-slate-300 dark:bg-[#94A3B8]/40 group-hover:bg-slate-400 dark:group-hover:bg-[#94A3B8]'}`} />
            全部站点
          </span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedRiver === '全部' ? 'text-blue-500 dark:text-[#3B82F6] rotate-90' : 'text-slate-300 dark:text-[#94A3B8]/40'}`} />
        </button>

        {rivers.map((river) => (
          <button
            key={river}
            onClick={() => { onSelectRiver(river); setMobileOpen(false); }}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
              transition-all duration-200 group
              ${selectedRiver === river
                ? 'bg-blue-50 dark:bg-[#3B82F6]/15 text-blue-700 dark:text-white'
                : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E2330] hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <span className={`w-1 h-1 rounded-full transition-colors ${selectedRiver === river ? 'bg-blue-500 dark:bg-[#3B82F6]' : 'bg-slate-300 dark:bg-[#94A3B8]/30 group-hover:bg-slate-400 dark:group-hover:bg-[#94A3B8]'}`} />
              {river}
            </span>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* 移动端浮动菜单按钮 */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-[60] w-12 h-12 rounded-full bg-blue-500 dark:bg-[#3B82F6] 
                   flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-[#3B82F6]/30
                   hover:bg-blue-600 dark:hover:bg-[#2563EB] transition-colors"
      >
        {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 dark:bg-black/50 z-[55]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:block w-60 bg-white dark:bg-[#141824] border-r border-slate-200 dark:border-[#2D3548] p-4 flex-shrink-0 overflow-y-auto transition-colors duration-300">
        {sidebarContent}
      </aside>

      {/* 移动端侧边栏抽屉 */}
      <aside className={`
        lg:hidden fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-[#141824] border-r border-slate-200 dark:border-[#2D3548] p-4 z-[56]
        transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </aside>
    </>
  );
}
