import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Database,
  ArrowDownToLine,
  ArrowUpToLine,
  HelpCircle
} from 'lucide-react';
import { testCloudConnection } from '../services/cloudStorage';

interface CloudConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudUrl: string;
  onSaveUrl: (url: string) => void;
  onPullFromCloud: () => Promise<void>;
  onPushToCloud: () => Promise<void>;
  lastSync: string;
  isSyncing: boolean;
}

export default function CloudConfigModal({
  isOpen,
  onClose,
  cloudUrl,
  onSaveUrl,
  onPullFromCloud,
  onPushToCloud,
  lastSync,
  isSyncing
}: CloudConfigModalProps) {
  const [urlInput, setUrlInput] = useState(cloudUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTestStatus('testing');
    setTestMessage('Menghubungkan ke Google Sheets...');
    const res = await testCloudConnection(urlInput);
    if (res.success) {
      setTestStatus('success');
      setTestMessage(res.message);
      onSaveUrl(urlInput);
    } else {
      setTestStatus('error');
      setTestMessage(res.message);
    }
  };

  const handleSave = () => {
    onSaveUrl(urlInput);
    onClose();
  };

  const handleCopyCodeSnippet = () => {
    const scriptCode = `// Silakan temukan kode lengkap Apps Script pada file google-apps-script/Code.gs di repositori aplikasi Anda`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Pengaturan Cloud Database (Google Sheets)</h2>
              <p className="text-xs text-slate-500">Sinkronkan data perpustakaan agar sama di semua laptop & perangkat</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">

          {/* Status Sinkronisasi Terkini */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">Status Koneksi Cloud</span>
              <p className="text-xs text-slate-600 mt-0.5">
                {cloudUrl ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <CheckCircle2 size={14} /> Terhubung ke Google Sheets
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold">
                    Mode Penyimpanan Lokal (Belum Terhubung Cloud)
                  </span>
                )}
              </p>
              {lastSync && (
                <p className="text-[11px] text-slate-400 mt-1">Sinkronisasi terakhir: {lastSync}</p>
              )}
            </div>

            {cloudUrl && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onPullFromCloud}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Tarik data terbaru dari Google Sheets"
                >
                  <ArrowDownToLine size={13} className={isSyncing ? 'animate-bounce' : ''} />
                  Tarik Data
                </button>
                <button
                  type="button"
                  onClick={onPushToCloud}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Kirim data dari laptop ini ke Google Sheets"
                >
                  <ArrowUpToLine size={13} className={isSyncing ? 'animate-bounce' : ''} />
                  Kirim Data
                </button>
              </div>
            )}
          </div>

          {/* Input URL Web App */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              URL Aplikasi Web Google Apps Script
            </label>
            <div className="flex gap-2">
              <input 
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setTestStatus('idle');
                  setTestMessage('');
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-mono transition outline-hidden"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testStatus === 'testing' || !urlInput.trim()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {testStatus === 'testing' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menguji...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Uji Koneksi</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Result alert */}
            {testStatus === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{testMessage}</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* Accordion / Panduan Cara Membuat Google Apps Script */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition"
            >
              <div className="flex items-center gap-2">
                <HelpCircle size={15} className="text-blue-600" />
                <span>Panduan 5 Langkah Membuat Database Google Sheets (Gratis)</span>
              </div>
              <span className="text-blue-600 font-medium">{showGuide ? 'Tutup' : 'Lihat Langkah'}</span>
            </button>

            {showGuide && (
              <div className="p-4 bg-white border-t border-slate-100 space-y-3 text-xs text-slate-600 leading-relaxed">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Buka tab baru dan buat Google Spreadsheet baru: 
                    <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline ml-1 inline-flex items-center gap-0.5">
                      sheets.new <ExternalLink size={10} />
                    </a>
                  </li>
                  <li>
                    Beri nama spreadsheet Anda (misal: <strong>Database Pustaka SMAN 1 LAMPASIO</strong>).
                  </li>
                  <li>
                    Klik menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Hapus semua tulisan di editor Apps Script, lalu salin seluruh isi berkas <code>google-apps-script/Code.gs</code> yang ada di repositori proyek Anda.
                  </li>
                  <li>
                    Klik tombol <strong>Terapkan (Deploy)</strong> di kanan atas &gt; <strong>Deployment baru</strong>:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-500">
                      <li>Jenis deployment: <strong>Aplikasi web</strong></li>
                      <li>Jalankan sebagai: <strong>Saya (email Anda)</strong></li>
                      <li>Siapa yang memiliki akses: <strong className="text-blue-700">Siapa saja (Anyone)</strong> *(wajib agar web dapat membaca/menulis)*</li>
                    </ul>
                  </li>
                  <li>
                    Klik <strong>Terapkan</strong>, berikan izin akses Google jika diminta, lalu salin <strong>URL Aplikasi Web</strong> yang didapat dan tempelkan ke kolom di atas.
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Simpan Pengaturan
          </button>
        </div>

      </div>
    </div>
  );
}
