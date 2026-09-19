import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Wallet, WalletType } from '../../types';
import { formatCurrency, formatNumberWithDots, parseNumberFromDots } from '../../lib/constants';
import { ConfirmModal } from '../ui/ConfirmModal';
import { 
  Wallet as WalletIcon, 
  Building2, 
  Smartphone, 
  PiggyBank, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  CreditCard 
} from 'lucide-react';

interface WalletsSectionProps {
  onSelectWallet?: (wallet: Wallet) => void;
}

export const WalletsSection: React.FC<WalletsSectionProps> = ({ onSelectWallet }) => {
  const { currentUser } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'wallets'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Wallet[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Wallet, 'id'>) });
        });
        setWallets(items);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'wallets');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const totalBalance = wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0);

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setName('');
    setType('bank');
    setBalance('');
    setAccountNumber('');
    setColor('#2563EB');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: Wallet, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWallet(w);
    setName(w.name);
    setType(w.type);
    setBalance(formatNumberWithDots(w.balance));
    setAccountNumber(w.accountNumber || '');
    setColor(w.color || '#2563EB');
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (w: Wallet, e: React.MouseEvent) => {
    e.stopPropagation();
    setWalletToDelete(w);
  };

  const executeDeleteWallet = async () => {
    if (!walletToDelete) return;
    try {
      await deleteDoc(doc(db, 'wallets', walletToDelete.id));
      setWalletToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name.trim()) return;
    setSubmitting(true);
    try {
      const parsedBalance = parseNumberFromDots(balance);
      if (editingWallet) {
        await updateDoc(doc(db, 'wallets', editingWallet.id), {
          name,
          type,
          balance: parsedBalance,
          accountNumber,
          color,
          updatedAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'wallets'), {
          userId: currentUser.uid,
          name,
          type,
          balance: parsedBalance,
          accountNumber,
          color,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      // Reset form state so former numbers leave no trace
      setName('');
      setBalance('');
      setAccountNumber('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save wallet error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getWalletIcon = (t: WalletType) => {
    switch (t) {
      case 'bank': return Building2;
      case 'ewallet': return Smartphone;
      case 'saving': return PiggyBank;
      default: return WalletIcon;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sumber Dana & Dompet
          </h2>
          <span className="text-xs text-slate-400">
            Total {wallets.length} dompet tersimpan
          </span>
        </div>
        <button
          type="button"
          id="btn-add-wallet"
          onClick={handleOpenAdd}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Horizontal Carousel of Wallets */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
        {wallets.map((wallet) => {
          const Icon = getWalletIcon(wallet.type);
          return (
            <div
              key={wallet.id}
              onClick={() => onSelectWallet && onSelectWallet(wallet)}
              className="min-w-[170px] sm:min-w-[190px] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all relative group cursor-pointer shrink-0 snap-start"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: wallet.color || '#2563EB' }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(wallet, e)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Edit Dompet"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeletePrompt(wallet, e)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                    title="Hapus Dompet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="font-semibold text-xs text-slate-700 dark:text-slate-200 truncate">
                {wallet.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate mb-1">
                {wallet.accountNumber ? wallet.accountNumber : wallet.type.toUpperCase()}
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {formatCurrency(wallet.balance)}
              </div>
            </div>
          );
        })}

        {/* Add Card Placeholder */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="min-w-[130px] p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 cursor-pointer snap-start"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Dompet Baru</span>
        </button>
      </div>

      {/* Add / Edit Wallet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {editingWallet ? 'Edit Dompet' : 'Tambah Dompet / Bank'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Dompet / Bank
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bank Mandiri, Dompet Tunai"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Sumber Dana
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as WalletType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="cash">Tunai (Cash)</option>
                  <option value="bank">Bank / Rekening</option>
                  <option value="ewallet">E-Wallet (GoPay, OVO, Dana)</option>
                  <option value="saving">Tabungan Khusus / Deposito</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Saldo Saat Ini
                  </label>
                  {balance && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      Rp {balance}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-bold font-mono text-xs text-slate-400 pointer-events-none select-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={balance}
                    onChange={(e) => setBalance(formatNumberWithDots(e.target.value))}
                    placeholder="0"
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono"
                    required
                  />
                  {balance && (
                    <button
                      type="button"
                      onClick={() => setBalance('')}
                      className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Rekening / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Contoh: 1234-5678-90"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Warna Identitas
                </label>
                <div className="flex gap-2">
                  {['#10B981', '#2563EB', '#8B5CF6', '#F59E0B', '#F43F5E', '#06B6D4'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-transform ${
                        color === c ? 'scale-110 ring-2 ring-slate-400' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Wallet Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(walletToDelete)}
        title="Hapus Dompet?"
        message={`Apakah Anda yakin ingin menghapus dompet "${walletToDelete?.name}"? Transaksi yang berkaitan tidak akan terhapus namun saldo dompet ini akan hilang.`}
        confirmText="Ya, Hapus Dompet"
        cancelText="Batal"
        isDanger={true}
        onConfirm={executeDeleteWallet}
        onCancel={() => setWalletToDelete(null)}
      />
    </div>
  );
};
