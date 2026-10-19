# Ngerti Pajakku

Situs edukasi pajak orang pribadi + kalkulator PPh 21 tahunan. Situs statis: tidak ada server, tidak ada build. Semua hitungan berjalan di browser pengguna.

## Isi folder

| File | Isinya |
| --- | --- |
| `index.html` | Beranda: Peta Pajak |
| `kalkulator.html`, `assets/kalkulator.js` | Kalkulator PPh 21 tahunan |
| `assets/rules.js` | **Angka aturan per tahun pajak** (tarif, PTKP, biaya jabatan, toleransi, nomor kolom BPA1) |
| `assets/calc.js` | Rumus hitungan |
| `materi/*.html` | Halaman materi (template sama) |
| `kamus.html`, `tentang.html` | Kamus istilah, privasi & batasan |
| `tests/calc.test.js` | Kasus uji dari dokumen periksa ahli pajak |

## Mengubah angka aturan

Semua angka ada di `assets/rules.js`. Setelah ahli pajak memeriksa, ubah `terverifikasi: false` menjadi `true` agar label "Versi uji coba" hilang. Tahun 2026: salin blok `2025`, ganti angkanya, dan isi `tersedia: true`.

## Menjalankan uji

```
npm test
```

## Menerbitkan

Hubungkan repositori GitHub ini ke Cloudflare Pages (tanpa build command, output directory `/`). Aktifkan Web Analytics dari dasbor Cloudflare Pages; tidak perlu mengubah kode.
