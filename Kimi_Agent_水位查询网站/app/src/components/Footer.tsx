import { Database, AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-6 pt-4 border-t border-slate-200 dark:border-[#2D3548]">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Database className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
            数据来源：四川省水文水资源勘测中心（
            <a
              href="http://www.schwr.com:8088/river"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              www.schwr.com
            </a>
            ），数据更新可能存在延迟，仅供参考。
          </p>
        </div>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
            免责声明：本网站仅做数据展示，不构成任何决策依据。请以官方发布的水雨情信息为准，防汛相关决策请咨询当地水利或应急管理部门。
          </p>
        </div>
      </div>
    </footer>
  );
}
