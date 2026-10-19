// Antarmuka kalkulator. Tidak ada fetch, penyimpanan, atau pengiriman data.
import { ATURAN } from './rules.js';
import { hitung, bandingkan } from './calc.js';

// Ganti dengan tautan tutorial resmi pengisian SPT di Coretax setelah dipastikan.
const TAUTAN_TUTORIAL_SPT = 'https://pajak.go.id/';
const TAUTAN_DJP = 'https://pajak.go.id/';

const PENOLAKAN = {
  tetap: 'Kalkulator ini khusus pegawai tetap. Pegawai tidak tetap, bukan pegawai, dan pensiunan dihitung dengan cara lain.',
  setahun: 'Kalkulator belum mendukung masa kerja kurang dari 12 bulan. Penghitungan untuk pegawai yang masuk atau keluar di tengah tahun memakai aturan khusus.',
  satu: 'Penggabungan beberapa bukti potong belum didukung. Bila Anda pindah kerja, semua bukti potong digabung saat lapor SPT Tahunan.',
  npwp: 'Kasus tanpa NPWP atau NIK yang terdaftar belum didukung, karena tarifnya berbeda.',
  ragu: 'Pastikan dulu status NPWP Anda. Biasanya nomor NPWP atau NIK tercantum di bagian identitas pada bukti potong.',
};

const NAMA_LANGKAH = {
  biayaJabatan: 'biaya jabatan',
  neto: 'penghasilan neto',
  ptkp: 'PTKP',
  pkp: 'penghasilan kena pajak (PKP)',
  pph: 'PPh 21 setahun',
};

const rp = (n) => 'Rp' + new Intl.NumberFormat('id-ID').format(n);
const angka = (s) => {
  const d = String(s ?? '').replace(/\D/g, '');
  return d === '' ? null : Number(d);
};

const form = document.getElementById('form');
const hasilEl = document.getElementById('hasil');
const tolakEl = document.getElementById('tolak');
const isianEl = document.getElementById('isian');
let aturan = null;

// Tahun pajak
const pilihTahun = document.getElementById('pilih-tahun');
for (const [tahun, a] of Object.entries(ATURAN)) {
  const label = document.createElement('label');
  label.innerHTML = `<input type="radio" name="tahun" value="${tahun}" ${a.tersedia ? '' : 'disabled'}> ${tahun}`;
  pilihTahun.append(label);
}
const catatan = Object.values(ATURAN).filter((a) => !a.tersedia).map((a) => a.catatan);
document.getElementById('catatan-tahun').textContent = catatan.join(' ');

function setTahun(tahun) {
  aturan = ATURAN[tahun];
  document.getElementById('belum-verifikasi').hidden = aturan.terverifikasi;
  for (const el of document.querySelectorAll('[data-kolom]')) {
    const kolom = aturan.kolom?.[el.dataset.kolom];
    const label = el.querySelector('label');
    label.querySelector('.kolom')?.remove();
    if (kolom) label.insertAdjacentHTML('beforeend', ` <span class="kolom muted small">(kolom ${kolom} di ${aturan.formulir})</span>`);
  }
  hasilEl.hidden = true;
}
const tahunAwal = Object.keys(ATURAN).find((t) => ATURAN[t].tersedia);
form.tahun.value = tahunAwal;
setTahun(tahunAwal);

// Penyaring
const PERTANYAAN = ['tetap', 'setahun', 'satu', 'npwp'];
function periksaPenyaring() {
  const jawab = Object.fromEntries(PERTANYAAN.map((q) => [q, form[q].value]));
  const alasan = PERTANYAAN.filter((q) => jawab[q] === 'tidak').map((q) => PENOLAKAN[q]);
  if (jawab.npwp === 'ragu') alasan.push(PENOLAKAN.ragu);

  if (alasan.length) {
    tolakEl.innerHTML = `
      <h2>Maaf, kasus Anda belum bisa dihitung di sini</h2>
      ${alasan.map((t) => `<p>${t}</p>`).join('')}
      <p>Anda tetap bisa mempelajari <a href="/materi/pph21.html">cara kerja PPh 21</a>, atau merujuk <a href="${TAUTAN_DJP}" rel="noopener">situs resmi DJP</a>.</p>`;
    tolakEl.hidden = false;
    isianEl.hidden = true;
    hasilEl.hidden = true;
    return;
  }
  tolakEl.hidden = true;
  isianEl.hidden = !PERTANYAAN.every((q) => jawab[q] === 'ya');
}

form.addEventListener('change', (e) => {
  if (e.target.name === 'tahun') setTahun(e.target.value);
  if (PERTANYAAN.includes(e.target.name)) periksaPenyaring();
});

// Format ribuan saat mengetik
form.addEventListener('input', (e) => {
  if (e.target.inputMode !== 'numeric') return;
  const n = angka(e.target.value);
  e.target.value = n === null ? '' : new Intl.NumberFormat('id-ID').format(n);
  e.target.closest('.field')?.querySelector('.err')?.remove();
});

function salah(id, pesan) {
  const field = document.getElementById(id).closest('.field');
  field.querySelector('.err')?.remove();
  field.insertAdjacentHTML('beforeend', `<div class="err">${pesan}</div>`);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  for (const el of form.querySelectorAll('.err')) el.remove();

  const input = {
    kawin: form.kawin.value === '1',
    tanggungan: Number(form.tanggungan.value),
    bruto: angka(form.bruto.value),
    iuran: angka(form.iuran.value) ?? 0,
    zakat: angka(form.zakat.value) ?? 0,
  };
  const bukti = {
    pph: angka(form.pph.value),
    biayaJabatan: angka(form.biayaJabatan.value),
    neto: angka(form.neto.value),
    ptkp: angka(form.ptkp.value),
    pkp: angka(form.pkp.value),
  };

  let ok = true;
  if (form.kawin.value === '') {
    ok = false;
    form.querySelector('input[name="kawin"]').closest('.q').insertAdjacentHTML('beforeend', '<div class="err">Pilih status kawin.</div>');
  }
  if (!input.bruto) { ok = false; salah('bruto', 'Isi penghasilan bruto setahun.'); }
  if (bukti.pph === null) { ok = false; salah('pph', 'Isi PPh 21 dari bukti potong. Isi 0 bila tertulis nol.'); }
  if (input.bruto && input.iuran + input.zakat >= input.bruto) {
    ok = false;
    salah('iuran', 'Iuran dan zakat tidak mungkin melebihi penghasilan bruto. Periksa lagi angkanya.');
  }
  if (!ok) {
    form.querySelector('.err')?.closest('.field, .q')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const h = hitung(input, aturan);
  const b = bandingkan(h, bukti, aturan);
  tampilkan(input, h, bukti, b);
});

function langkah({ kunci, judul, nilai, rumus, awam }, h, bukti, b) {
  const beda = kunci && bukti[kunci] != null && Math.abs(h[kunci] - bukti[kunci]) > aturan.toleransi;
  return `
    <li class="${beda && !b.cocok ? 'beda' : ''}">
      <div class="row"><span class="judul">${judul}</span><span class="nilai">${rp(nilai)}</span></div>
      ${rumus ? `<div class="rumus">${rumus}</div>` : ''}
      <p class="awam">${awam}</p>
      ${beda && !b.cocok ? `<div class="banding">Di bukti potong Anda: ${rp(bukti[kunci])}</div>` : ''}
    </li>`;
}

function tampilkan(input, h, bukti, b) {
  const status = `${input.kawin ? 'K' : 'TK'}/${input.tanggungan}`;
  const bj = aturan.biayaJabatan;
  const kenaBatas = h.biayaJabatan === bj.maksSetahun;

  const tabelTarif = h.rincianTarif.length
    ? `<div class="table-scroll"><table>
        <thead><tr><th>Lapisan PKP</th><th class="num">Tarif</th><th class="num">Pajak</th></tr></thead>
        <tbody>${h.rincianTarif.map((r) => `<tr><td>${rp(r.dasar)}</td><td class="num">${r.tarif}%</td><td class="num">${rp(r.pajak)}</td></tr>`).join('')}</tbody>
      </table></div>`
    : '';

  const daftar = [
    { judul: 'Penghasilan bruto setahun', nilai: h.bruto,
      awam: 'Semua yang Anda terima dari kantor selama setahun, sebelum dipotong apa pun.' },
    { kunci: 'biayaJabatan', judul: 'Dikurangi biaya jabatan', nilai: h.biayaJabatan,
      rumus: kenaBatas ? `${bj.persen}% × ${rp(h.bruto)}, tapi maksimal ${rp(bj.maksSetahun)}` : `${bj.persen}% × ${rp(h.bruto)}`,
      awam: 'Potongan otomatis yang dianggap sebagai biaya Anda bekerja. Anda tidak perlu menunjukkan bukti apa pun.' },
    { judul: 'Dikurangi iuran pensiun / JHT / THT', nilai: h.iuran,
      awam: 'Iuran hari tua yang dipotong dari gaji Anda boleh dikurangkan sebelum pajak dihitung.' },
    ...(h.zakat ? [{ judul: 'Dikurangi zakat lewat kantor', nilai: h.zakat,
      awam: 'Zakat yang dibayarkan kantor ke lembaga resmi boleh dikurangkan dari penghasilan.' }] : []),
    { kunci: 'neto', judul: 'Penghasilan neto', nilai: h.neto,
      rumus: `${rp(h.bruto)} − ${rp(h.biayaJabatan)} − ${rp(h.iuran)}${h.zakat ? ` − ${rp(h.zakat)}` : ''}`,
      awam: 'Penghasilan setelah dikurangi potongan-potongan di atas.' },
    { kunci: 'ptkp', judul: `Dikurangi PTKP (${status})`, nilai: h.ptkp,
      awam: 'Bagian penghasilan yang dibebaskan dari pajak. Besarnya tergantung status kawin dan jumlah tanggungan.' },
    { kunci: 'pkp', judul: 'Penghasilan kena pajak (PKP)', nilai: h.pkp,
      rumus: h.pkp === 0 ? 'Penghasilan neto tidak melebihi PTKP, jadi PKP = 0' : `${rp(h.neto)} − ${rp(h.ptkp)}, dibulatkan ke bawah ke ribuan`,
      awam: h.pkp === 0 ? 'Penghasilan Anda masih di bawah batas bebas pajak.' : 'Inilah bagian penghasilan yang benar-benar dikenai pajak.' },
    { kunci: 'pph', judul: 'PPh 21 setahun', nilai: h.pph,
      rumus: tabelTarif,
      awam: 'Pajak dihitung bertingkat: Rp60 juta pertama kena 5%, bagian berikutnya sampai Rp250 juta kena 15%, dan seterusnya.' },
  ];

  const arah = b.selisih > 0 ? 'lebih tinggi' : 'lebih rendah';
  const kepala = b.cocok
    ? `<div class="status status-ok">
        <h2>Cocok</h2>
        <p>Hitungan kami ${rp(h.pph)}, sama dengan PPh 21 di bukti potong Anda (${rp(bukti.pph)})${b.selisih ? `; selisih ${rp(Math.abs(b.selisih))} wajar karena pembulatan` : ''}.</p>
      </div>`
    : `<div class="status status-beda">
        <h2>Hitungan kami berbeda ${rp(Math.abs(b.selisih))}</h2>
        <p>Kami menghitung PPh 21 setahun ${rp(h.pph)}, ${arah} daripada yang tercatat di bukti potong Anda (${rp(bukti.pph)}).
        ${b.langkahBeda ? `Perbedaan mulai muncul di langkah <strong>${NAMA_LANGKAH[b.langkahBeda]}</strong>, yang ditandai merah di bawah.` : ''}</p>
      </div>`;

  const sebabBeda = b.cocok ? '' : `
    <h2>Apa yang sebaiknya dilakukan?</h2>
    <ol class="steps">
      <li><div class="judul">Periksa ulang isian</div>
        <p class="awam">Salah ketik adalah penyebab paling umum. Cocokkan lagi ${b.langkahBeda && b.langkahBeda !== 'pph' ? `angka <strong>${NAMA_LANGKAH[b.langkahBeda]}</strong> dan ` : ''}penghasilan bruto serta status PTKP (${status}) dengan bukti potong Anda.</p></li>
      <li><div class="judul">Pastikan kasus Anda didukung</div>
        <p class="awam">Kalkulator ini hanya untuk pegawai tetap yang bekerja Januari–Desember di satu kantor. Bila Anda pindah kerja, mulai bekerja di tengah tahun, atau status keluarga berubah, hasilnya bisa berbeda.</p></li>
      <li><div class="judul">Tanyakan ke HR atau bagian payroll</div>
        <p class="awam">Bila isian sudah benar dan kasus Anda didukung, Anda bisa bertanya dengan sopan. Contoh pertanyaan:</p>
        <ul class="small">
          <li>"Status PTKP apa yang dipakai untuk menghitung pajak saya tahun ${form.tahun.value}?"</li>
          <li>"Apakah ada penghasilan atau potongan yang tidak tercantum di slip gaji tapi masuk ke bukti potong?"</li>
          <li>"Boleh minta rincian perhitungan PPh 21 masa Desember saya?"</li>
        </ul></li>
    </ol>
    <p class="small muted">Kami tidak menyarankan Anda mengubah SPT berdasarkan hitungan ini saja.</p>`;

  hasilEl.innerHTML = `
    ${kepala}
    <h2>Langkah demi langkah</h2>
    <ol class="steps">${daftar.map((d) => langkah(d, h, bukti, b)).join('')}</ol>
    ${sebabBeda}
    <a class="cta" href="${TAUTAN_TUTORIAL_SPT}" rel="noopener">Lanjut lapor SPT: tutorial resmi Coretax dari DJP →</a>
    <button type="button" class="btn-ghost" id="ulang">Hitung ulang</button>
    <p class="small muted">Materi edukasi, bukan konsultasi pajak.</p>`;
  hasilEl.hidden = false;
  hasilEl.focus({ preventScroll: true });
  hasilEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('ulang').addEventListener('click', () => {
    hasilEl.hidden = true;
    form.bruto.focus();
  });
}
