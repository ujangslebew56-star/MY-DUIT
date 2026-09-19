import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db, collection, query, where, onSnapshot, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Transaction } from '../../types';
import { formatCurrency } from '../../lib/constants';
import { 
  FileText, 
  Download, 
  PieChart as PieIcon, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Layers 
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const CHART_COLORS = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#F97316',
  '#14B8A6',
  '#6366F1',
  '#64748B',
];

export const ReportsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { primaryColor, theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Month and Year selector
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }));
        setTransactions(list);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'transactions');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  // Filter transactions for selected month
  const monthlyTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const netSavings = totalIncome - totalExpense;

  // Breakdown by Category for Pie Chart
  const categoryMap: { [name: string]: number } = {};
  monthlyTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const name = t.categoryName || 'Lainnya';
      categoryMap[name] = (categoryMap[name] || 0) + Number(t.amount);
    });

  const pieData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Weekly breakdown for Bar Chart (Week 1 to Week 5)
  const weeklyData = [
    { name: 'Mgg 1', Pemasukan: 0, Pengeluaran: 0 },
    { name: 'Mgg 2', Pemasukan: 0, Pengeluaran: 0 },
    { name: 'Mgg 3', Pemasukan: 0, Pengeluaran: 0 },
    { name: 'Mgg 4', Pemasukan: 0, Pengeluaran: 0 },
    { name: 'Mgg 5', Pemasukan: 0, Pengeluaran: 0 },
  ];

  monthlyTransactions.forEach((t) => {
    if (!t.date) return;
    const day = new Date(t.date).getDate();
    let weekIndex = Math.floor((day - 1) / 7);
    if (weekIndex > 4) weekIndex = 4;
    const amount = Number(t.amount) || 0;
    if (t.type === 'income') {
      weeklyData[weekIndex].Pemasukan += amount;
    } else if (t.type === 'expense') {
      weeklyData[weekIndex].Pengeluaran += amount;
    }
  });

  const sortedCategories = [...pieData];

  // Export to CSV
  const handleExportCSV = () => {
    if (monthlyTransactions.length === 0) {
      alert('Tidak ada transaksi untuk diekspor pada bulan ini');
      return;
    }

    const headers = ['Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Dompet', 'Catatan'];
    const rows = monthlyTransactions.map((t) => [
      t.date,
      t.type,
      `"${t.categoryName}"`,
      t.amount,
      `"${t.walletName}"`,
      `"${t.note || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MY_DUIT_Laporan_${selectedYear}_${selectedMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      {/* Header & Export button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Laporan & Analisis</h1>
          <p className="text-xs text-slate-400">Evaluasi visual statistik arus kas keuangan Anda</p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Month & Year Filter */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="flex-1 px-3 py-1.5 text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
        >
          {months.map((m, idx) => (
            <option key={idx} value={idx} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {m}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="w-24 px-3 py-1.5 text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-200 outline-none border-l border-slate-200 dark:border-slate-800 cursor-pointer"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Financial Health Summary Banner */}
      <div
        className="p-5 rounded-3xl text-white shadow-md space-y-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #0f172a 0%, ${primaryColor}66 100%)`,
        }}
      >
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Arus Kas Bersih (Net Cash Flow)</span>
          <span
            className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
              netSavings >= 0 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
            }`}
          >
            {netSavings >= 0 ? 'Surplus (+)' : 'Defisit (-)'}
          </span>
        </div>
        <div className="text-2xl font-black font-mono tracking-tight">
          {formatCurrency(netSavings)}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-300 block text-[11px] mb-0.5">Total Pemasukan</span>
            <strong className="text-emerald-400 font-mono text-sm">{formatCurrency(totalIncome)}</strong>
          </div>
          <div>
            <span className="text-slate-300 block text-[11px] mb-0.5">Total Pengeluaran</span>
            <strong className="text-rose-400 font-mono text-sm">{formatCurrency(totalExpense)}</strong>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Chart Header & Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Grafik Keuangan
            </h3>
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                chartType === 'pie'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Kategori</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Mingguan</span>
            </button>
          </div>
        </div>

        {/* Chart Canvas Rendering */}
        {monthlyTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada data transaksi di bulan {months[selectedMonth]} {selectedYear}.
          </div>
        ) : chartType === 'pie' ? (
          <div>
            {pieData.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada data pengeluaran untuk ditampilkan di diagram lingkaran.
              </div>
            ) : (
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          stroke={isDark ? '#0f172a' : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const percent = totalExpense > 0 ? ((Number(data.value) / totalExpense) * 100).toFixed(1) : '0';
                          return (
                            <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700">
                              <span className="font-semibold block">{data.name}</span>
                              <div className="font-mono text-emerald-400 font-bold mt-0.5">
                                {formatCurrency(Number(data.value))} ({percent}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-medium">Total Beban</span>
                  <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100">
                    {formatCurrency(totalExpense)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                  tickFormatter={(val) => (val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`)}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700 space-y-1">
                          <span className="font-bold text-slate-300 block">{label}</span>
                          <div className="text-emerald-400 font-mono">
                            Masuk: {formatCurrency(Number(payload[0]?.value) || 0)}
                          </div>
                          <div className="text-rose-400 font-mono">
                            Keluar: {formatCurrency(Number(payload[1]?.value) || 0)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => <span className="text-slate-600 dark:text-slate-400 font-medium">{value}</span>}
                />
                <Bar dataKey="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Expenses Breakdown List */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Rincian Kategori Pengeluaran
          </h3>
          <span className="text-xs text-slate-400">{sortedCategories.length} Kategori</span>
        </div>

        {sortedCategories.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Tidak ada pengeluaran di periode {months[selectedMonth]} {selectedYear}.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map((item, index) => {
              const percent = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
              const barColor = CHART_COLORS[index % CHART_COLORS.length];
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: barColor }}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
