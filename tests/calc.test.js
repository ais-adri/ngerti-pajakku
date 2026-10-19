// Kasus uji dari dokumen periksa ahli pajak (Sesi 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hitung, bandingkan } from '../assets/calc.js';
import { ATURAN } from '../assets/rules.js';

const a = ATURAN[2025];

const kasus = [
  ['1 sedikit di atas PTKP', { kawin: false, tanggungan: 0, bruto: 60_000_000, iuran: 1_200_000 }, 90_000],
  ['2 di bawah PTKP', { kawin: false, tanggungan: 0, bruto: 54_000_000, iuran: 1_080_000 }, 0],
  ['3 contoh rumus', { kawin: true, tanggungan: 1, bruto: 120_000_000, iuran: 2_400_000 }, 2_430_000],
  ['4 batas biaya jabatan + zakat', { kawin: true, tanggungan: 3, bruto: 300_000_000, iuran: 6_000_000, zakat: 7_500_000 }, 25_275_000],
  ['5 lapisan 25%', { kawin: false, tanggungan: 1, bruto: 400_000_000, iuran: 8_000_000 }, 50_875_000],
  ['6 pembulatan', { kawin: true, tanggungan: 0, bruto: 100_123_456 }, 1_830_850],
];

for (const [nama, input, harapan] of kasus) {
  test(`kasus ${nama}`, () => {
    assert.equal(hitung(input, a).pph, harapan);
  });
}

test('rincian kasus 3', () => {
  const h = hitung(kasus[2][1], a);
  assert.equal(h.biayaJabatan, 6_000_000);
  assert.equal(h.neto, 111_600_000);
  assert.equal(h.ptkp, 63_000_000);
  assert.equal(h.pkp, 48_600_000);
});

test('selisih dalam toleransi dianggap cocok', () => {
  const h = hitung(kasus[2][1], a);
  assert.equal(bandingkan(h, { pph: 2_429_500 }, a).cocok, true);
});

test('beda: menunjuk langkah pertama yang berbeda', () => {
  const h = hitung(kasus[2][1], a);
  const b = bandingkan(h, { biayaJabatan: 6_000_000, neto: 111_600_000, ptkp: 58_500_000, pph: 2_655_000 }, a);
  assert.equal(b.cocok, false);
  assert.equal(b.selisih, -225_000);
  assert.equal(b.langkahBeda, 'ptkp');
});
