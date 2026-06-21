# Responsive To-Do List

To-do list sederhana berbasis HTML/CSS/JS murni (tanpa framework, tanpa build step). Data tersimpan di `localStorage` browser, jadi semua berjalan di sisi klien — tidak butuh server atau database.

## Fitur

- Tambah task dengan prioritas (Low / Medium / High)
- Task aktif otomatis diurutkan berdasarkan prioritas
- Tandai task selesai (pindah ke kolom Done) dan batalkan lagi
- Hapus task per item atau hapus semua sekaligus
- Edit nama & role profil, avatar otomatis menampilkan inisial nama
- Data persist di `localStorage` — tetap ada setelah refresh/tutup tab
- Layout responsif (kolom Agenda/Done jadi tumpuk vertikal di layar < 650px)

## Struktur file

```
.
├── index.html   # markup halaman
├── style.css    # semua styling (pakai CSS custom properties / design tokens)
└── script.js    # logika app: CRUD task, sort, localStorage, profil
```

## Cara menjalankan

Tidak ada proses build. Cukup buka `index.html` langsung di browser, atau pakai live server (mis. ekstensi Live Server di VS Code) supaya lebih nyaman saat development.

## Catatan teknis

- **Penyimpanan**: `localStorage` bersifat per-browser, per-device. Tidak ada sinkronisasi lintas perangkat dan tidak ada backup — kalau user clear browser data, semua task hilang.
- **Sumber warna prioritas**: ditentukan lewat atribut `data-prioritas` di setiap `<li class="task-item">`, di-style murni lewat CSS attribute selector (`.task-item[data-prioritas="high"]`), bukan lewat class JS terpisah.
- **Edit profil**: masih pakai `prompt()` browser bawaan (dua kali: nama lalu role). Cukup untuk kebutuhan sekarang, tapi UX-nya kasar — kandidat kuat untuk diganti modal kalau project ini dikembangkan lebih lanjut.

## Keputusan desain yang belum final

- Urutan sort task aktif saat ini **Low → High** (task High priority muncul paling bawah), mengikuti urutan dropdown. Belum dikonfirmasi apakah ini perilaku yang diinginkan atau seharusnya dibalik (High di atas).

## Riwayat perbaikan

- Fix: typo nama fungsi (`pasangUEventListener` → `pasangUlangEventListener`) yang menyebabkan `ReferenceError` dan menghentikan seluruh script setelah ada task yang pernah ditandai selesai lalu halaman di-refresh.
- Fix: variabel global tidak sengaja (`ClinicalDate`) akibat chained assignment di `dapatkanWaktuSekarang()`.
- Restyle: emoji diganti SVG icon, palet warna dan tipografi diperbarui ke arah tampilan yang lebih profesional (Inter + IBM Plex Mono, accent biru muted).
