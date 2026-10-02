# Roadmap: Laravel + PostgreSQL + React (16 minggu)

Dipetakan dari rencana belajar pribadi "Laravel + PostgreSQL + Frontend" (PHP/Laravel dasar → PostgreSQL → Auth/API → Tailwind → React → Security → Deploy), tapi tiap fase langsung menghasilkan fitur portfolio ini, bukan latihan terpisah. Centang tiap item selesai; ini dokumen hidup, di-update tiap milestone.

**Fase 0 — Scaffold** ✅ *(PR ini)*
- [x] Struktur repo (backend/frontend/docker/docs)
- [x] Laravel API skeleton + Postgres config + Sanctum terpasang
- [x] React + Vite + Tailwind + i18n (ID/EN) + dark mode skeleton
- [x] Docker Compose dev & prod + Traefik + Cloudflare Tunnel plan
- [x] Dokumentasi awal

---

## Fase 1 — PHP, Laravel Dasar & Fondasi Frontend (Minggu 1-3)
- [ ] PHP dasar: syntax, array, function
- [ ] OOP dasar: class, object, inheritance
- [ ] Struktur folder Laravel (udah ter-scaffold, tinggal dipahami)
- [ ] Routing dasar, Blade templating
- [ ] Eloquent ORM: query data, relasi (one-to-many, many-to-many)
- [ ] Migration dasar
- [ ] CSS Flexbox & Grid (latihan interaktif)
- [ ] JS native: fetch, async/await, manipulasi DOM
- [ ] **Output:** model + migration + CRUD `Project` (bukan "catatan tugas", langsung data project kamu)

## Fase 2 — PostgreSQL & Desain Database (Minggu 4-5)
- [ ] SQL dasar: SELECT, WHERE, JOIN, GROUP BY
- [ ] Desain ERD
- [ ] Migration lanjutan: foreign key, index
- [ ] Seeding data dummy
- [ ] **Output:** redesign DB — relasi `Project`↔tags, `BlogPost`↔category

## Fase 3 — Auth & REST API (Minggu 6-7)
- [ ] Laravel Authentication bawaan (login/register) — manual, bukan Filament
- [ ] REST API routes + API Resources (format response JSON)
- [ ] Testing API pakai Postman
- [ ] Setup CORS (sudah dikonfigurasi di scaffold, tinggal divalidasi dengan endpoint nyata)
- [ ] **Output:** halaman login admin + endpoint publik `GET /api/projects`, `GET /api/blog-posts`

## Fase 4 — Styling: Tailwind CSS (Minggu 8)
- [ ] Utility classes, responsive breakpoints, component patterns
- [ ] **Output:** admin panel (Blade) di-styling rapi dengan Tailwind

## Fase 5 — React Mendalam (Minggu 9-12)
- [ ] Refresh komponen, props, `useState`
- [ ] Konsumsi API Laravel dari React (`apiGet` helper sudah ada, tinggal diisi endpoint nyata)
- [ ] `useEffect` untuk fetch data + loading/error state
- [ ] `useContext` untuk data lintas komponen
- [ ] State management dengan Zustand (kalau dibutuhkan)
- [ ] Component reusability & folder structure rapi
- [ ] **Output:** Projects & Blog section nampilin data asli dari API (bukan empty state lagi)

## Fase 6 — Security Practice (Minggu 13-14)
- [ ] Laravel Sanctum untuk auth API berbasis token (kalau admin area dipindah ke React)
- [ ] Validasi input (Form Request validation)
- [ ] Review OWASP Top 10 terapannya di web app sendiri
- [ ] Audit: input tak tervalidasi, password hashing, rate limiting login admin
- [ ] **Output:** `docs/SECURITY.md` checklist ter-audit — ini juga konten bagus buat LinkedIn

## Fase 7 — Deploy (Minggu 15-16)
- [ ] Deploy ke homeserver (bukan Railway/Vercel) — lihat `docs/DEPLOYMENT.md`
- [ ] Setup `.env` production aman (tidak ter-commit)
- [ ] Cloudflare Tunnel + Traefik jalan, domain nyambung
- [ ] Backup database otomatis jalan (`db-backup` service)
- [ ] Tes end-to-end di environment live
- [ ] **Output:** portfolio live di domain asli

---

## Rencana lanjutan (di luar 16 minggu, "nanti dulu")
- Internal apps lain (todo list, dll) di `app.nfab.my.id` — arsitektur udah disiapkan (lihat `docs/ARCHITECTURE.md`), tinggal tambah service baru pas waktunya.
