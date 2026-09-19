import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, collection, query, where, onSnapshot, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Wallet, Transaction } from '../../types';
import { formatCurrency, formatDateIndo } from '../../lib/constants';
import { WalletsSection } from '../wallets/WalletsSection';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Sparkles, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  Receipt, 
  ChevronRight, 
  CreditCard 
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAddModal: () => void;
  onOpenScanner: () => void;
  onViewAllTransactions: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onOpenScanner,
  onViewAllTransactions,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Totals for the current month
  const [thisMonthIncome, setThisMonthIncome] = useState(0);
  const [thisMonthExpense, setThisMonthExpense] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    // 1. Wallets listener
    const qW = query(collection(db, 'wallets'), where('userId', '==', currentUser.uid));
    const unsubW = onSnapshot(
      qW,
      (snapshot) => {
        const list: Wallet[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Wallet, 'id'>) }));
        setWallets(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'wallets');
      }
    );

    // 2. Transactions listener
    const qT = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid));
    const unsubT = onSnapshot(
      qT,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }));
        list.sort((a, b) => b.createdAt - a.createdAt);

        setRecentTransactions(list.slice(0, 5));

        // Calculate this month totals
        const curMonth = new Date().getMonth();
        const curYear = new Date().getFullYear();

        let inc = 0;
        let exp = 0;

        list.forEach((t) => {
          if (!t.date) return;
          const d = new Date(t.date);
          if (d.getMonth() === curMonth && d.getFullYear() === curYear) {
            if (t.type === 'income') inc += Number(t.amount) || 0;
            if (t.type === 'expense') exp += Number(t.amount) || 0;
          }
        });

        setThisMonthIncome(inc);
        setThisMonthExpense(exp);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'transactions');
        setLoading(false);
      }
    );

    return () => {
      unsubW();
      unsubT();
    };
  }, [currentUser]);

  const totalAccumulatedBalance = wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0);

  return (
    <div className="space-y-5 pb-6">
      {/* Welcome & Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 shadow-xl shadow-slate-950/10 border border-slate-800">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">
                Halo, {userProfile?.displayName || currentUser?.displayName || 'Sahabat'} 👋
              </span>
              <h1 className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mt-0.5">
                Total Akumulasi Saldo
              </h1>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wide border border-emerald-500/30">
              Cloud Sync Aktif
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
            {formatCurrency(totalAccumulatedBalance)}
          </div>

          {/* Monthly In & Out Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/5">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold mb-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Pemasukan Bulan Ini</span>
              </div>
              <div className="font-mono font-bold text-sm text-slate-100">
                {formatCurrency(thisMonthIncome)}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/5">
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold mb-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Pengeluaran Bulan Ini</span>
              </div>
              <div className="font-mono font-bold text-sm text-slate-100">
                {formatCurrency(thisMonthExpense)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (Smart OCR Scan & Add Manual) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          id="btn-quick-ocr-scan"
          onClick={onOpenScanner}
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-400 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <strong className="block text-xs font-bold text-emerald-900 dark:text-emerald-200">
            Smart Scan Struk
          </strong>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            Deteksi struk otomatis AI
          </span>
        </button>

        <button
          type="button"
          id="btn-quick-add-tx"
          onClick={onOpenAddModal}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
            <Plus className="w-4 h-4" />
          </div>
          <strong className="block text-xs font-bold text-slate-800 dark:text-slate-100">
            Input Transaksi
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Manual / transfer dompet
          </span>
        </button>
      </div>

      {/* Customizable Wallets Carousel */}
      <WalletsSection />

      {/* Recent Transactions Snippet */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Transaksi Terakhir
          </h2>
          <button
            type="button"
            onClick={onViewAllTransactions}
            className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center p-4">
            <Receipt className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Belum ada transaksi bulan ini
            </span>
            <span className="text-[11px] text-slate-400">
              Yuk mulai catat pengeluaran Anda hari ini!
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isExp = tx.type === 'expense';
              const isInc = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isExp
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-500'
                          : isInc
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500'
                          : 'bg-blue-50 dark:bg-blue-950/50 text-blue-500'
                      }`}
                    >
                      {isExp && <ArrowDownRight className="w-4 h-4" />}
                      {isInc && <ArrowUpRight className="w-4 h-4" />}
                      {!isExp && !isInc && <Plus className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {tx.categoryName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {formatDateIndo(tx.date)} • {tx.walletName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <div
                      className={`font-mono font-bold text-xs ${
                        isExp
                          ? 'text-rose-600 dark:text-rose-400'
                          : isInc
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isExp ? '-' : isInc ? '+' : ''}
                      {formatCurrency(tx.amount)}
                    </div>
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
