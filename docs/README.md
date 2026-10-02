# Portofolio — Dokumentasi

Portfolio personal, sekaligus "project kendaraan" buat [roadmap belajar Laravel + PostgreSQL + React](./ROADMAP.md) (16 minggu, 7 fase). Projects & Blog di portfolio ini jadi CRUD beneran, bukan latihan generik.

## Dokumen lain
- [ARCHITECTURE.md](./ARCHITECTURE.md) — stack, struktur domain, kenapa pilihan ini diambil
- [ROADMAP.md](./ROADMAP.md) — checklist 7 fase, dicentang progresif
- [DEPLOYMENT.md](./DEPLOYMENT.md) — langkah deploy ke homeserver
- [SECURITY.md](./SECURITY.md) — checklist hardening

## Quickstart (lokal)

Butuh: Docker + Docker Compose. (Composer/Node lokal opsional, cuma dipakai kalau mau jalanin tanpa Docker.)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000 (coba http://localhost:8000/api/health)

Tanpa Docker (jalanin langsung):

```bash
# Backend — butuh PostgreSQL lokal, sesuaikan backend/.env
cd backend && composer install && php artisan migrate && php artisan serve

# Frontend (terminal terpisah)
cd frontend && npm install && npm run dev
```

## Struktur repo

```
portofolio/
├── backend/     # Laravel API
├── frontend/    # React + Vite + Tailwind
├── docker/      # Dockerfile tiap service + config nginx
├── docs/        # dokumen ini
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

## Status

Ini scaffold awal (Fase 0 — belum masuk hitungan 16 minggu roadmap): struktur project, konfigurasi dasar, docs. Belum ada fitur CRUD/auth — itu mulai di Fase 1. Lihat [ROADMAP.md](./ROADMAP.md) buat urutan lengkapnya.
