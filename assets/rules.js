// Aturan hitung PPh 21 tahunan per tahun pajak.
// Semua angka di sini BELUM diverifikasi ahli pajak (sesi 1: 20 Okt 2026).
// Setelah diperiksa, ubah `terverifikasi` menjadi true.

export const ATURAN = {
  2025: {
    tersedia: true,
    terverifikasi: false,
    formulir: 'BPA1',
    // [batas atas PKP setahun, tarif %] — Pasal 17 ayat (1) huruf a UU PPh (UU HPP)
    lapisanTarif: [
      [60_000_000, 5],
      [250_000_000, 15],
      [500_000_000, 25],
      [5_000_000_000, 30],
      [Infinity, 35],
    ],
    // PMK 101/PMK.010/2016
    ptkp: { dasar: 54_000_000, kawin: 4_500_000, perTanggungan: 4_500_000, maksTanggungan: 3 },
    biayaJabatan: { persen: 5, maksSetahun: 6_000_000 },
    // Selisih (Rp) yang masih dianggap "cocok" karena pembulatan
    toleransi: 1_000,
    // Nomor kolom BPA1 untuk tiap isian; diisi setelah dikonfirmasi ahli
    kolom: { bruto: null, iuran: null, zakat: null, biayaJabatan: null, neto: null, ptkp: null, pkp: null, pph: null },
  },
  2026: {
    tersedia: false,
    catatan: 'Tahun pajak 2026 tersedia mulai Januari 2027.',
  },
};
