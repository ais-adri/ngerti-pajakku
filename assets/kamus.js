// Penyaring kamus sederhana; tidak mengirim apa pun.
const cari = document.getElementById('cari');
const dts = [...document.querySelectorAll('#daftar dt')];
const kosong = document.getElementById('kosong');

cari.addEventListener('input', () => {
  const q = cari.value.trim().toLowerCase();
  let ada = 0;
  for (const dt of dts) {
    const dd = dt.nextElementSibling;
    const cocok = !q || (dt.textContent + ' ' + dd.textContent).toLowerCase().includes(q);
    dt.hidden = dd.hidden = !cocok;
    if (cocok) ada++;
  }
  kosong.hidden = ada > 0;
});
