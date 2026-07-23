# Task Management App — Technical Test (Moonlay Technologies)

Aplikasi Task Management sederhana: user bisa menambah, mengedit, menghapus, dan melihat
daftar task, lengkap dengan status, deadline, dan assignee. Termasuk fitur **AI Chatbot**
untuk bertanya seputar data task.

## Quick Start (Singkat)

Jika hanya ingin menjalankan aplikasi dengan cepat, ikuti perintah ini di DUA terminal terpisah.

Backend (Windows PowerShell):

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend (macOS / Linux):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend (new terminal):

```bash
cd frontend
npm install
npm run dev
# buka http://localhost:3000
```

Login demo: `ges` / `password123` (seeded user).

Chatbot singkat:

- Mode default: rule-based — tidak perlu API key, langsung bekerja setelah backend berjalan.
- Mode LLM: isi `OPENAI_API_KEY` di `backend/.env` lalu restart backend untuk mengaktifkan OpenAI.
- Coba dari UI (ikon 💬) atau panggil `POST /chatbot/ask` dengan body `{ "message": "..." }` dan header `Authorization: Bearer <token>`.

## Tech Stack

| Layer    | Teknologi                                        |
| -------- | ------------------------------------------------ |
| Frontend | Next.js (React)                                  |
| Backend  | Python — FastAPI                                 |
| Database | PostgreSQL                                       |
| Auth     | JWT (JSON Web Token)                             |
| Chatbot  | Rule-based intent matching + opsional OpenAI LLM |

## Struktur Folder

```
moonlay-task-management/
├── backend/                # FastAPI + PostgreSQL + JWT + Chatbot
│   ├── app/
│   │   ├── main.py         # entrypoint
│   │   ├── config.py       # baca .env
│   │   ├── database.py     # koneksi SQLAlchemy
│   │   ├── models.py       # tabel users & tasks
│   │   ├── schemas.py      # Pydantic schema
│   │   ├── auth.py         # JWT + hashing password
│   │   ├── seed.py         # seed user demo saat startup
│   │   ├── chatbot/service.py  # logika chatbot
│   │   └── routers/        # auth.py, users.py, tasks.py, chatbot.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # Next.js
│   ├── pages/               # login, index (list task), tasks/new, tasks/edit/[id]
│   ├── components/          # TaskForm, TaskList, Chatbot
│   ├── lib/                 # api.js, auth.js
│   └── package.json
└── docs/
    ├── ERD.dbml              # source ERD (buka di dbdiagram.io)
    ├── ERD.png                # gambar ERD siap pakai
    └── postman_collection.json
```

## 1. Persiapan Database (PostgreSQL)

Pastikan PostgreSQL sudah terinstal dan berjalan, lalu buat database:

```bash
psql -U postgres -c "CREATE DATABASE task_management;"
```

Tabel akan **dibuat otomatis** oleh SQLAlchemy saat backend pertama kali dijalankan
(tidak perlu migration manual untuk test ini).

## 2. Menjalankan Backend (FastAPI)

```bash
cd backend
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

- API berjalan di: `http://localhost:8000`
- Dokumentasi interaktif (Swagger): `http://localhost:8000/docs`
- Saat startup, backend otomatis membuat tabel dan **seed 5 user demo** untuk login
  dan dropdown assignee (lihat bagian Login di bawah).

## 3. Menjalankan Frontend (Next.js)

Buka terminal baru:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend berjalan di: `http://localhost:3000`

## 4. Login (Hardcode/Seed User)

Login sederhana menggunakan user yang di-seed otomatis oleh backend saat startup
(password sama untuk semua, hanya untuk keperluan demo/technical test):

| Username | Password    |
| -------- | ----------- |
| ges      | password123 |
| paul     | password123 |
| tasya    | password123 |
| grace    | password123 |
| diva     | password123 |

Password disimpan ter-hash (bcrypt) di database dan token yang dipakai untuk otentikasi
setiap request adalah JWT asli — hanya kredensial demonya yang di-hardcode/di-seed agar
reviewer bisa langsung mencoba tanpa membuat akun.

## 5. Alur Pemakaian

1. Login di halaman `/login`.
2. Lihat daftar task di halaman utama.
3. Klik **+ Tambah Task** untuk membuat task baru (isi judul, deskripsi, status,
   deadline, dan pilih assignee dari dropdown yang datanya diambil dari endpoint
   `GET /users`).
4. Ubah status langsung dari dropdown status di setiap card task.
5. Klik **Edit** untuk mengubah detail task, atau **Hapus** untuk menghapusnya.
   - Hapus sekarang menampilkan konfirmasi dalam popup modal (bukan `confirm()` browser) untuk pengalaman yang lebih rapi.
   - Klik judul atau tombol **View** untuk melihat deskripsi task dalam popup modal.
6. Klik ikon 💬 di pojok kanan bawah untuk membuka **AI Chatbot** dan bertanya
   seputar data task.

## 6. Dokumentasi API (Postman)

1. Buka Postman → **Import** → pilih file `docs/postman_collection.json`.
2. Jalankan request **Auth → Login** terlebih dahulu — token otomatis tersimpan
   ke variable collection `{{token}}` (lewat Postman test script).
3. Semua request lain (Tasks, Users, Chatbot) otomatis memakai `{{token}}` di header
   `Authorization: Bearer {{token}}`.
4. Setiap request sudah dilengkapi contoh response.

## 7. ERD (Entity Relationship Diagram)

- Source: `docs/ERD.dbml` — buka di [dbdiagram.io](https://dbdiagram.io) untuk melihat/mengedit
  diagram interaktif.
- Gambar siap pakai: `docs/ERD.png`.

Ringkasan skema:

- **users**: `id (PK, uuid)`, `name`, `username (unique)`, `hashed_password`, `created_at`
- **tasks**: `id (PK, uuid)`, `title`, `description`, `status (enum)`, `deadline`,
  `assignee_id (FK -> users.id)`, `created_at`, `updated_at`
- Relasi: satu `user` (sebagai assignee) dapat memiliki banyak `task` → **One-to-Many**.

## 8. Fitur AI Chatbot

Endpoint: `POST /chatbot/ask` (butuh header `Authorization: Bearer <token>`).

**Cara kerja:**

1. Saat menerima pertanyaan, backend mengambil seluruh data task dari PostgreSQL dan
   meringkasnya menjadi konteks.
2. **Mode LLM (opsional):** jika `OPENAI_API_KEY` diisi di `backend/.env`, pertanyaan +
   konteks task dikirim ke OpenAI Chat Completion (`app/chatbot/service.py`, fungsi
   `_llm_answer`) sehingga chatbot bisa memahami pertanyaan berbahasa natural yang
   bervariasi. Model default: `gpt-4o-mini` (bisa diganti lewat `OPENAI_MODEL`).
3. **Mode rule-based (default, tanpa API key):** jika `OPENAI_API_KEY` kosong, backend
   otomatis memakai intent-matching berbasis keyword (`_rule_based_answer`) yang sudah
   menjawab ke-4 contoh pertanyaan pada soal test:
   - "Tampilkan semua task yang statusnya belum selesai."
   - "Berapa jumlah task yang sudah selesai?"
   - "Tugas apa saja yang deadlinenya hari ini?"
   - "Siapa assignee dari task [judul task]?"
4. Jika mode LLM dipilih tapi pemanggilan API gagal (mis. quota habis/tidak ada koneksi),
   sistem otomatis **fallback** ke mode rule-based supaya fitur tetap berfungsi saat
   direview.

**Menjalankan fitur chatbot:**

- Tanpa setup tambahan — cukup jalankan backend seperti biasa, chatbot langsung aktif
  di mode rule-based.
- Untuk mengaktifkan mode LLM sungguhan: isi `OPENAI_API_KEY` (dan opsional
  `OPENAI_MODEL`) di `backend/.env`, lalu restart backend.
- Coba lewat UI: klik ikon 💬 di frontend, atau lewat Postman: request
  **Chatbot → Ask Chatbot**.

## 9. Kredensial Demo Login (Ringkasan)

Sesuai poin "Login sederhana (boleh hardcode user)" pada soal — kredensial di atas
di-seed otomatis oleh backend, tidak perlu registrasi manual untuk mencoba aplikasi ini.

---

## Quick Start (Recommended for Reviewers)

Follow these exact steps in TWO separate terminals so the frontend and backend run concurrently.

1. Start backend (Windows PowerShell / macOS / Linux):

```bash
# Windows (PowerShell)
cd backend
.\venv\Scripts\Activate.ps1   # if using venv; or use your Python environment
pip install -r requirements.txt
copy .env.example .env           # Windows (or `cp .env.example .env` on macOS/Linux)
uvicorn app.main:app --reload --port 8000
```

```bash
# macOS / Linux
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

2. Start frontend (new terminal):

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

3. Quick verification checklist (what reviewers should try):

- Open `http://localhost:3000` and login using seeded credentials (e.g. `ges` / `password123`).
- Create a new task, check it appears in the list.
- Click **View** to open the description modal and **Edit** to modify the task.
- Delete a task — a confirmation modal should appear before deletion.
- Open `http://localhost:8000/docs` to view backend Swagger docs.
- Import `docs/postman_collection.json` into Postman and run the **Auth → Login** request first; then run the Tasks tests.

4. Run automated Postman checks (optional):

```bash
# Install newman globally if you want to run collection tests
npm install -g newman
newman run docs/postman_collection.json --env-var "base_url=http://localhost:8000"
```

## Reviewer Notes

- If you want to test the LLM-powered chatbot, set `OPENAI_API_KEY` in `backend/.env` and restart the backend; otherwise the chatbot runs in rule-based mode by default (no API key required).
- If you see duplicate assignees in the dropdown, the frontend deduplicates by name; ideally reviewers should check the `GET /users` response to confirm source data.
- The Postman collection includes a few test assertions (status codes + basic shape checks) to help automated screening.
