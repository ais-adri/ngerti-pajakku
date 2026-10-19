// Hitungan PPh 21 tahunan pegawai tetap. Fungsi murni, tanpa akses jaringan.
// Semua nilai dalam rupiah bulat.

export function ptkpSetahun(kawin, tanggungan, aturan) {
  const p = aturan.ptkp;
  const t = Math.min(Math.max(tanggungan, 0), p.maksTanggungan);
  return p.dasar + (kawin ? p.kawin : 0) + t * p.perTanggungan;
}

export function pphBerlapis(pkp, lapisan) {
  const rincian = [];
  let bawah = 0;
  let total = 0;
  for (const [atas, tarif] of lapisan) {
    if (pkp <= bawah) break;
    const dasar = Math.min(pkp, atas) - bawah;
    const pajak = Math.floor((dasar * tarif) / 100);
    rincian.push({ dari: bawah, sampai: Math.min(pkp, atas), tarif, dasar, pajak });
    total += pajak;
    bawah = atas;
  }
  return { total, rincian };
}

// input: { kawin, tanggungan, bruto, iuran, zakat }
export function hitung(input, aturan) {
  const { bruto, iuran = 0, zakat = 0 } = input;
  const bj = aturan.biayaJabatan;
  const biayaJabatan = Math.min(Math.floor((bruto * bj.persen) / 100), bj.maksSetahun);
  const neto = bruto - biayaJabatan - iuran - zakat;
  const ptkp = ptkpSetahun(input.kawin, input.tanggungan, aturan);
  const pkp = Math.max(0, Math.floor((neto - ptkp) / 1000) * 1000);
  const pph = pphBerlapis(pkp, aturan.lapisanTarif);
  return { bruto, biayaJabatan, iuran, zakat, neto, ptkp, pkp, pph: pph.total, rincianTarif: pph.rincian };
}

// Langkah yang angkanya bisa dicocokkan dengan bukti potong, urut sesuai rumus
export const LANGKAH_BANDING = ['biayaJabatan', 'neto', 'ptkp', 'pkp', 'pph'];

// bukti: angka dari bukti potong; hanya `pph` yang wajib, sisanya opsional
export function bandingkan(hasil, bukti, aturan) {
  const selisih = hasil.pph - bukti.pph;
  const cocok = Math.abs(selisih) <= aturan.toleransi;
  let langkahBeda = null;
  if (!cocok) {
    langkahBeda = LANGKAH_BANDING.find(
      (k) => bukti[k] != null && Math.abs(hasil[k] - bukti[k]) > aturan.toleransi
    ) ?? null;
  }
  return { cocok, selisih, langkahBeda };
}
