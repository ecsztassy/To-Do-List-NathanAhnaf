const todoInput = document.getElementById('todo-input');
const priorityInput = document.getElementById('priority-input');
const addBtn = document.getElementById('add-btn');
const activeList = document.getElementById('active-list');
const doneList = document.getElementById('done-list');
const clearAllBtn = document.getElementById('clear-all-btn');

// Elemen Profil
const editProfileBtn = document.getElementById('edit-profile-btn');
const profileName = document.getElementById('profile-name');
const profileRole = document.getElementById('profile-role');
const profileAvatar = document.getElementById('profile-avatar');

// Icon SVG untuk tombol delete per-task (dipasang lewat JS karena elemen dibuat dinamis)
const ICON_TRASH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

// Bobot Nilai Urutan Prioritas (Low ke High)
const bobotPrioritas = {
    'low': 1,
    'medium': 2,
    'high': 3
};

// ==========================================
// 1. FUNGSI SINKRONISASI, STORAGE & URUTAN
// ==========================================

// Mengurutkan elemen di tabel Agenda berdasarkan LOW -> MEDIUM -> HIGH
function urutkanTabelAgenda() {
    const items = Array.from(activeList.querySelectorAll('.task-item'));

    items.sort((itemA, itemB) => {
        const prioritasA = itemA.getAttribute('data-prioritas') || 'low';
        const prioritasB = itemB.getAttribute('data-prioritas') || 'low';
        return bobotPrioritas[prioritasA] - bobotPrioritas[prioritasB];
    });

    items.forEach(item => activeList.appendChild(item));
}

// Mengambil inisial dari nama profil untuk ditampilkan di avatar
function dapatkanInisial(nama) {
    const bersih = (nama || '').trim();
    if (!bersih) return '?';
    const kata = bersih.split(/\s+/);
    if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
    return (kata[0][0] + kata[kata.length - 1][0]).toUpperCase();
}

function perbaruiAvatar() {
    profileAvatar.textContent = dapatkanInisial(profileName.textContent);
}

// Fungsi untuk menyimpan semua data ke LocalStorage
function simpanSemuaData() {
    localStorage.setItem('namaProfil', profileName.textContent);
    localStorage.setItem('roleProfil', profileRole.textContent);
    localStorage.setItem('htmlActiveList', activeList.innerHTML);
    localStorage.setItem('htmlDoneList', doneList.innerHTML);
}

// Fungsi untuk memuat data dari LocalStorage saat pertama kali halaman dibuka
function muatDataDariStorage() {
    const namaTersimpan = localStorage.getItem('namaProfil');
    const roleTersimpan = localStorage.getItem('roleProfil');
    const activeListTersimpan = localStorage.getItem('htmlActiveList');
    const doneListTersimpan = localStorage.getItem('htmlDoneList');

    if (namaTersimpan) profileName.textContent = namaTersimpan;
    if (roleTersimpan) profileRole.textContent = roleTersimpan;
    perbaruiAvatar();

    if (activeListTersimpan) {
        activeList.innerHTML = activeListTersimpan;
        pasangUlangEventListener(activeList, false);
    }
    if (doneListTersimpan) {
        doneList.innerHTML = doneListTersimpan;
        // NB: sebelumnya ada typo di sini (pasangUEventListener) yang menyebabkan
        // ReferenceError dan menghentikan eksekusi script setelah ada task selesai
        // tersimpan. Sudah diperbaiki ke nama fungsi yang benar.
        pasangUlangEventListener(doneList, true);
    }
}

// Fungsi pembantu untuk memasang kembali fungsi klik setelah halaman di-refresh
function pasangUlangEventListener(parentList, isDoneTable) {
    const items = parentList.querySelectorAll('.task-item');
    items.forEach(li => {
        const checkbox = li.querySelector('input[type="checkbox"]');
        const deleteBtn = li.querySelector('.delete-task-btn');
        const metaSpan = li.querySelector('.task-meta');

        const waktuDibuat = li.getAttribute('data-waktu-buat');
        const priority = li.getAttribute('data-prioritas');

        checkbox.checked = isDoneTable;

        checkbox.addEventListener('change', function() {
            if (checkbox.checked) {
                li.classList.add('completed');
                const waktuSelesai = dapatkanWaktuSekarang();
                metaSpan.innerHTML = `Selesai: ${waktuSelesai} | <span class="prio-${priority}">${priority.toUpperCase()}</span>`;
                doneList.appendChild(li);
            } else {
                li.classList.remove('completed');
                metaSpan.innerHTML = `Dibuat: ${waktuDibuat} | <span class="prio-${priority}">${priority.toUpperCase()}</span>`;
                activeList.appendChild(li);
                urutkanTabelAgenda();
            }
            simpanSemuaData();
        });

        deleteBtn.addEventListener('click', function() {
            li.remove();
            simpanSemuaData();
        });
    });
}

// Fungsi mendapatkan format string Tanggal & Jam Indonesia
function dapatkanWaktuSekarang() {
    const sekarang = new Date();
    const opsiWaktu = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formatTanggal = sekarang.toLocaleDateString('id-ID', opsiWaktu);
    const formatJam = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${formatTanggal} jam ${formatJam}`;
}

// Jalankan otomatis fungsi muat data setiap kali aplikasi dijalankan
muatDataDariStorage();

// ==========================================
// 2. LOGIKA UTAMA INTERAKSI USER
// ==========================================

// Tombol Edit Profil
editProfileBtn.addEventListener('click', function() {
    const newName = prompt("Masukkan nama baru Anda:", profileName.textContent);
    if (newName !== null && newName.trim() !== "") {
        profileName.textContent = newName.trim();
    }

    const newRole = prompt("Masukkan jabatan/role baru Anda:", profileRole.textContent);
    if (newRole !== null && newRole.trim() !== "") {
        profileRole.textContent = newRole.trim();
    }
    perbaruiAvatar();
    simpanSemuaData();
});

// Fungsi Menambahkan Agenda Baru
function addTask() {
    const taskText = todoInput.value.trim();
    const priority = priorityInput.value;

    if (taskText === '') {
        alert('Tuliskan agenda Anda terlebih dahulu!');
        return;
    }

    const waktuDibuat = dapatkanWaktuSekarang();

    const li = document.createElement('li');
    li.className = 'task-item';
    li.setAttribute('data-waktu-buat', waktuDibuat);
    li.setAttribute('data-prioritas', priority);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'task-info';

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = taskText;

    const metaSpan = document.createElement('span');
    metaSpan.className = 'task-meta';
    metaSpan.innerHTML = `Dibuat: ${waktuDibuat} | <span class="prio-${priority}">${priority.toUpperCase()}</span>`;

    infoDiv.appendChild(textSpan);
    infoDiv.appendChild(metaSpan);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-task-btn';
    deleteBtn.innerHTML = ICON_TRASH;

    deleteBtn.addEventListener('click', function() {
        li.remove();
        simpanSemuaData();
    });

    li.appendChild(checkbox);
    li.appendChild(infoDiv);
    li.appendChild(deleteBtn);

    activeList.appendChild(li);
    todoInput.value = '';

    urutkanTabelAgenda();

    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            li.classList.add('completed');
            const waktuSelesai = dapatkanWaktuSekarang();
            metaSpan.innerHTML = `Selesai: ${waktuSelesai} | <span class="prio-${priority}">${priority.toUpperCase()}</span>`;
            doneList.appendChild(li);
        } else {
            li.classList.remove('completed');
            metaSpan.innerHTML = `Dibuat: ${waktuDibuat} | <span class="prio-${priority}">${priority.toUpperCase()}</span>`;
            activeList.appendChild(li);
            urutkanTabelAgenda();
        }
        simpanSemuaData();
    });

    simpanSemuaData();
}

addBtn.addEventListener('click', addTask);
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTask();
});

clearAllBtn.addEventListener('click', function() {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh To-Do list?')) {
        activeList.innerHTML = '';
        doneList.innerHTML = '';
        simpanSemuaData();
    }
});
