document.getElementById('formDaftar').addEventListener('submit', async function (e) {
  e.preventDefault(); // Mencegah reload halaman

  // Ambil elemen input
  const nisInput    = document.getElementById('nis');
  const namaInput   = document.getElementById('nama');
  const divisiInput = document.getElementById('divisi');
  const emailInput  = document.getElementById('email');

  const nis    = nisInput.value.trim();
  const nama   = namaInput.value.trim();
  const divisi = divisiInput.value;
  const email  = emailInput.value.trim();

  // Ambil elemen pesan error
  const errNis    = document.getElementById('errNis');
  const errNama   = document.getElementById('errNama');
  const errDivisi = document.getElementById('errDivisi');
  const errEmail  = document.getElementById('errEmail');
  const msgBox    = document.getElementById('responseMessage');
  const btnSubmit = document.getElementById('btnSubmit');

  // Reset semua pesan error sebelum validasi ulang
  [errNis, errNama, errDivisi, errEmail].forEach(el => el.classList.add('hidden'));
  msgBox.classList.add('hidden');

  let isValid = true;

  // Validasi NIS (RegEx 8 digit angka)
  const nisRegex = /^[0-9]{8}$/;
  if (!nisRegex.test(nis)) {
    errNis.classList.remove('hidden');
    isValid = false;
  }

  // Validasi Nama
  if (nama.length < 3) {
    errNama.classList.remove('hidden');
    isValid = false;
  }

  // Validasi Divisi
  if (divisi === '') {
    errDivisi.classList.remove('hidden');
    isValid = false;
  }

  // Validasi Email (RegEx sederhana)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errEmail.classList.remove('hidden');
    isValid = false;
  }

  if (!isValid) return; // Hentikan jika ada field yang tidak valid

  // Payload JSON
  const payload = { nis, nama, divisi, email };

  // Nonaktifkan tombol saat proses pengiriman berlangsung
  btnSubmit.disabled = true;
  btnSubmit.innerText = 'MENGIRIM...';

  try {
    const response = await fetch('api.php?action=daftar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Tangani jika server mengembalikan status HTTP error (4xx/5xx)
    let result;
    try {
      result = await response.json();
    } catch (parseErr) {
      throw new Error('Respons server tidak valid (bukan JSON).');
    }

    msgBox.classList.remove('hidden');

    if (response.ok && result.status === 'success') {
      msgBox.className = 'mt-4 p-3 rounded-lg text-sm text-center font-medium bg-emerald-950 border border-emerald-500 text-emerald-300';
      msgBox.innerText = result.message;
      document.getElementById('formDaftar').reset();
    } else {
      msgBox.className = 'mt-4 p-3 rounded-lg text-sm text-center font-medium bg-rose-950 border border-rose-500 text-rose-300';
      msgBox.innerText = result.message || 'Terjadi kesalahan pada server.';
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    msgBox.classList.remove('hidden');
    msgBox.className = 'mt-4 p-3 rounded-lg text-sm text-center font-medium bg-rose-950 border border-rose-500 text-rose-300';
    msgBox.innerText = 'Terjadi kesalahan koneksi ke server backend!';
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = 'KIRIM PENDAFTARAN';
  }
});