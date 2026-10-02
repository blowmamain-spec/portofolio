# Arsitektur

## Stack

| Layer | Teknologi | Kenapa |
|---|---|---|
| Backend API | Laravel 12 (PHP 8.3) | Sesuai roadmap belajar Fase 1-3, 6 |
| Database | PostgreSQL 16 | Sesuai roadmap Fase 2 |
| Auth admin | Laravel built-in auth + Sanctum (manual, bukan Filament) | Belajar auth dari nol — pilihan sadar, bukan keterbatasan |
| Frontend | React 19 + Vite + Tailwind CSS v4 | Sesuai roadmap Fase 4-5 |
| i18n | react-i18next (ID/EN) | Dwibahasa, toggle di navbar |
| Routing | React Router | SPA, siap buat halaman detail blog `/blog/:slug` nanti |
| Container | Docker Compose | Self-host di homeserver |
| Reverse proxy | Traefik v3 | Routing berbasis subdomain lewat Docker label — tinggal nambah service baru buat app baru |
| Expose ke internet | Cloudflare Tunnel (`cloudflared`) | IP homeserver nggak pernah ke-expose, nggak perlu buka port router |

## Diagram

```
Internet
   │
Cloudflare (DNS + edge TLS)
   │
cloudflared (tunnel keluar dari homeserver, nggak ada port yang dibuka)
   │
Traefik (routing by Host header, HTTP biasa karena TLS udah kelar di edge)
   ├── nfab.my.id      → frontend (nginx + static React build)
   ├── api.nfab.my.id  → backend (nginx + php-fpm, satu container)
   └── (nanti) app.nfab.my.id → service lain, tinggal nambah di compose
                │
         PostgreSQL (volume persistent)
                │
         db-backup (pg_dump harian + rotasi, lihat DEPLOYMENT.md)
```

## Kenapa Traefik + Cloudflare Tunnel (bukan port-forward biasa)

Port-forward tradisional expose IP rumah ke publik (butuh DDNS kalau IP ISP dinamis, dan jadi target scan/serangan langsung). Cloudflare Tunnel sebaliknya: `cloudflared` di homeserver yang bikin koneksi keluar ke Cloudflare, bukan nunggu koneksi masuk — jadi nggak ada port yang perlu dibuka di router sama sekali.

Traefik di antara `cloudflared` dan container aplikasi, bukan `cloudflared` langsung ke tiap container, karena: `cloudflared` cuma perlu satu ingress rule (ke Traefik), dan tiap kali nambah app/subdomain baru cukup nambah Docker label di compose — nggak perlu ubah config `cloudflared`.

## Kenapa satu container buat nginx+php-fpm (backend)

Setup "production-grade" biasanya misahin nginx dan php-fpm jadi dua container. Di sini digabung satu container buat simplicity operasional di homeserver pribadi — trade-off yang sadar, bukan ketidaktahuan. Kalau nanti traffic/kompleksitas naik, gampang dipecah ulang.

## Model data (rencana, diisi bertahap di Fase 1-3)

- `projects` — title, description_id/description_en, tech_stack, demo_url, github_url, image, featured
- `blog_posts` — title, slug, content_id/content_en, published_at, tags
- `experiences` — title, organization, period, description
- `skills` — name, category, icon (atau tetap config statis di frontend kalau dirasa nggak perlu DB)
- `users` — admin login (Laravel built-in auth)

Dwibahasa pakai kolom `_id`/`_en` per field, bukan tabel translation terpisah — lebih simpel buat skala portfolio.

## Kenapa React SPA murni, bukan Next.js

Roadmap belajar eksplisit milih React + Vite (bukan Next.js) buat fokus ke fundamental React dulu. Konsekuensinya: SPA client-rendered, SEO & link preview (OG tags) lebih lemah dibanding SSR. Mitigasi direncanakan di Fase 5-6: backend Laravel bisa serve meta tag dasar per halaman, atau pakai `react-helmet` + prerender plugin ringan — dicatat sebagai item, bukan diabaikan.
