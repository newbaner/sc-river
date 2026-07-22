import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ProcessedStation } from '@/types/river';
import { loadStationsFast, getRiverList } from '@/services/riverData';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileFilterBar from '@/components/MobileFilterBar';
import StatsBar from '@/components/StatsBar';
import StationCard from '@/components/StationCard';
import Footer from '@/components/Footer';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [stations, setStations] = useState<ProcessedStation[]>([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isApiLoading, setIsApiLoading] = useState(false); // 后台API请求中
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiver, setSelectedRiver] = useState('全部');

  // 首次加载：本地数据秒开 + 后台尝试Worker
  useEffect(() => {
    setIsApiLoading(true);
    loadStationsFast((data) => {
      setStations(data);
      if (data.length > 0) {
        const tm = new Date(data[0].tm);
        setLastUpdated(
          `${(tm.getMonth() + 1).toString().padStart(2, '0')}-${tm.getDate().toString().padStart(2, '0')} ${tm.getHours().toString().padStart(2, '0')}:${tm.getMinutes().toString().padStart(2, '0')}`
        );
      }
    });
    // 3秒后无论API是否成功，都关闭提示
    const timer = setTimeout(() => setIsApiLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 手动刷新：重新加载数据
  const handleRefresh = useCallback(() => {
    if (isApiLoading) return;
    setIsApiLoading(true);
    loadStationsFast((data) => {
      setStations(data);
      if (data.length > 0) {
        const tm = new Date(data[0].tm);
        setLastUpdated(
          `${(tm.getMonth() + 1).toString().padStart(2, '0')}-${tm.getDate().toString().padStart(2, '0')} ${tm.getHours().toString().padStart(2, '0')}:${tm.getMinutes().toString().padStart(2, '0')}`
        );
      }
      setIsApiLoading(false);
    });
  }, [isApiLoading]);

  const rivers = useMemo(() => getRiverList(stations), [stations]);

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchesRiver = selectedRiver === '全部' || station.riverName === selectedRiver;
      const matchesSearch = !searchQuery ||
        station.stnm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.riverName.includes(searchQuery) ||
        station.location.includes(searchQuery);
      return matchesRiver && matchesSearch;
    });
  }, [stations, selectedRiver, searchQuery]);

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-[#141824] flex flex-col overflow-hidden transition-colors duration-300">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        isLoading={isApiLoading}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          rivers={rivers}
          selectedRiver={selectedRiver}
          onSelectRiver={setSelectedRiver}
          stationCount={stations.length}
          filteredCount={filteredStations.length}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* API加载提示 */}
          {isApiLoading && (
            <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-[#3B82F6]/10 border border-blue-200 dark:border-[#3B82F6]/20 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-blue-600 dark:text-blue-400">
                正在尝试获取实时数据...
              </span>
            </div>
          )}

          {/* 统计栏 */}
          {stations.length > 0 && <StatsBar stations={stations} />}

          {/* 移动端河流筛选 */}
          {stations.length > 0 && (
            <MobileFilterBar
              rivers={rivers}
              selectedRiver={selectedRiver}
              onSelectRiver={setSelectedRiver}
            />
          )}

          {/* 数据网格 */}
          {filteredStations.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-slate-500 dark:text-[#94A3B8] mb-2">未找到匹配的站点</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedRiver('全部'); }}
                  className="text-sm text-blue-500 hover:underline"
                >
                  清除筛选条件
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredStations.map((station, index) => (
                <StationCard
                  key={station.stcd}
                  station={station}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* 底部 */}
          <Footer />
          <div className="h-4" />
        </main>
      </div>
    </div>
  );
}

export default App;
