/**
 * Layanan Sinkronisasi Cloud Database (Google Sheets via Google Apps Script)
 */

import { Book, Member, Borrowing } from '../types';

export const CLOUD_URL_STORAGE_KEY = 'lib_cloud_gas_url';
export const LAST_SYNC_STORAGE_KEY = 'lib_last_cloud_sync';

export interface CloudPayload {
  action: 'syncAll' | 'saveBooks' | 'saveMembers' | 'saveBorrowings';
  books?: Book[];
  members?: Member[];
  borrowings?: Borrowing[];
}

export interface CloudFetchResult {
  books?: Book[];
  members?: Member[];
  borrowings?: Borrowing[];
}

/**
 * Mendapatkan URL Google Apps Script yang tersimpan
 */
export function getSavedCloudUrl(): string {
  return localStorage.getItem(CLOUD_URL_STORAGE_KEY) || '';
}

/**
 * Menyimpan URL Google Apps Script ke penyimpanan lokal
 */
export function saveCloudUrl(url: string): void {
  const trimmed = url.trim();
  if (trimmed) {
    localStorage.setItem(CLOUD_URL_STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(CLOUD_URL_STORAGE_KEY);
  }
}

/**
 * Mendapatkan waktu sinkronisasi terakhir
 */
export function getLastSyncTime(): string {
  return localStorage.getItem(LAST_SYNC_STORAGE_KEY) || '';
}

/**
 * Memperbarui waktu sinkronisasi terakhir
 */
export function recordLastSyncTime(): string {
  const nowStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  localStorage.setItem(LAST_SYNC_STORAGE_KEY, nowStr);
  return nowStr;
}

/**
 * Menguji koneksi ke Google Apps Script Web App
 */
export async function testCloudConnection(url: string): Promise<{ success: boolean; message: string; dataCount?: { books: number; members: number; borrowings: number } }> {
  if (!url || !url.startsWith('https://script.google.com/')) {
    return {
      success: false,
      message: 'Format URL tidak valid. Pastikan diawali dengan https://script.google.com/.../exec'
    };
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Koneksi gagal dengan status HTTP ${response.status}. Pastikan deployment diatur ke "Siapa saja" (Anyone).`
      };
    }

    const data = await response.json();
    if (data && data.status === 'success') {
      const bCount = data.data?.books?.length || 0;
      const mCount = data.data?.members?.length || 0;
      const tCount = data.data?.borrowings?.length || 0;
      return {
        success: true,
        message: `Terhubung dengan Google Sheets! (${bCount} buku, ${mCount} anggota, ${tCount} peminjaman)`,
        dataCount: { books: bCount, members: mCount, borrowings: tCount }
      };
    } else {
      return {
        success: false,
        message: data.message || 'Format balasan dari server tidak sesuai.'
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'Gagal terhubung: ' + (err.message || 'Periksa koneksi internet dan izin deployment Google Apps Script.')
    };
  }
}

/**
 * Mengambil data terbaru dari Google Sheets
 */
export async function fetchCloudData(url: string): Promise<CloudFetchResult | null> {
  if (!url) return null;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) return null;
    const json = await response.json();

    if (json && json.status === 'success' && json.data) {
      recordLastSyncTime();
      return json.data;
    }
    return null;
  } catch (e) {
    console.warn('Gagal mengambil data dari cloud, beralih ke cache lokal:', e);
    return null;
  }
}

/**
 * Mengirim dan menyinkronkan data ke Google Sheets
 */
export async function syncToCloud(url: string, payload: CloudPayload): Promise<boolean> {
  if (!url) return false;

  try {
    // Gunakan text/plain untuk mencegah isu preflight CORS OPTIONS pada Google Apps Script
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    recordLastSyncTime();
    return true;
  } catch (err) {
    console.error('Error saat menyinkronkan ke cloud:', err);
    return false;
  }
}
