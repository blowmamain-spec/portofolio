# Security Checklist

Ini project beneran di-expose ke internet dari homeserver pribadi — bukan demo di Vercel yang ada managed security di belakangnya. Checklist ini diisi bertahap, terutama di Fase 6 roadmap, tapi beberapa poin dasar udah masuk dari scaffold awal.

## Sudah ada (scaffold)
- [x] `.env` tidak ter-commit (`.gitignore`), `.env.example` tanpa secret asli
- [x] CORS dibatasi ke `FRONTEND_URL` spesifik, bukan wildcard `*`
- [x] Security headers dasar di nginx (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- [x] Dotfiles (`.env`, `.git`) di-deny lewat nginx kalau somehow ke-expose di web root
- [x] Homeserver tidak expose port langsung ke internet (Cloudflare Tunnel, bukan port-forward)

## Fase 3 (Auth)
- [ ] Password hashing pakai default Laravel (bcrypt/argon2) — jangan custom
- [ ] Rate limiting di route login (`throttle` middleware) — cegah brute-force
- [ ] CSRF protection aktif buat form admin (default Laravel, pastikan nggak sengaja dimatiin)

## Fase 6 (Security Practice)
- [ ] Form Request validation di semua endpoint yang nerima input
- [ ] Review OWASP Top 10 satu-satu, catat yang relevan & cara Laravel udah/belum proteksi
- [ ] Audit: endpoint API publik nggak expose data sensitif (misal field internal di model)
- [ ] Sanctum token expiry kalau dipakai buat admin API
- [ ] `APP_DEBUG=false` di production (cek `.env` production, bukan `.env.example`)

## Operasional (homeserver)
- [ ] Update image base (php, nginx, postgres) berkala — jangan `latest` tanpa pernah di-rebuild
- [ ] Backup database ke luar homeserver, bukan cuma rotasi lokal (lihat DEPLOYMENT.md §5)
- [ ] Cloudflare Access (opsional) buat halaman admin — extra layer di depan Traefik, gratis buat personal use
- [ ] Jangan expose Traefik dashboard ke publik (dashboard tidak diaktifkan di compose prod — cek ulang kalau mau nyalain buat debug, matiin lagi setelahnya)

## Catatan
Checklist ini jangan dianggap selesai sekali isi — tiap nambah fitur baru (terutama yang nerima input user), balik cek ulang poin-poin di atas.
