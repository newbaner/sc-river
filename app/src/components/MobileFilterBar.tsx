import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileFilterBarProps {
  rivers: string[];
  selectedRiver: string;
  onSelectRiver: (river: string) => void;
}

export default function MobileFilterBar({ rivers, selectedRiver, onSelectRiver }: MobileFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -120 : 120;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const allRivers = ['全部', ...rivers];

  return (
    <div className="lg:hidden relative mb-4">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full 
                   bg-white/90 dark:bg-[#1E2330]/90 backdrop-blur-sm border border-slate-200 dark:border-[#2D3548]
                   flex items-center justify-center shadow-sm"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8]" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full 
                   bg-white/90 dark:bg-[#1E2330]/90 backdrop-blur-sm border border-slate-200 dark:border-[#2D3548]
                   flex items-center justify-center shadow-sm"
      >
        <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8]" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-9 py-1 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allRivers.map((river) => (
          <button
            key={river}
            onClick={() => onSelectRiver(river)}
            className={`
              flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200 whitespace-nowrap
              ${selectedRiver === river
                ? 'bg-blue-500 dark:bg-[#3B82F6] text-white shadow-sm shadow-blue-500/25 dark:shadow-[#3B82F6]/25'
                : 'bg-white dark:bg-[#1E2330] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#2D3548] hover:border-blue-300 dark:hover:border-[#3B82F6]/40'
              }
            `}
          >
            {river === '全部' ? '全部站点' : river}
          </button>
        ))}
      </div>
    </div>
  );
}
