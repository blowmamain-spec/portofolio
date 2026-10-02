# Deployment ke Homeserver

Deploy manual (git pull + docker compose up) — pilihan sadar di awal buat belajar tiap step-nya, bukan auto-deploy CI/CD.

## Prasyarat
- Docker + Docker Compose terpasang di homeserver
- Domain udah dibeli, DNS-nya dipindah/dikelola Cloudflare (gratis, cukup ganti nameserver di registrar)
- Akun Cloudflare Zero Trust (gratis buat skala ini)

## 1. Setup Cloudflare Tunnel (sekali di awal)
1. Masuk ke [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/) → **Networks → Tunnels**
2. **Create a tunnel** → pilih connector **Docker**
3. Cloudflare kasih command berisi token — ambil tokennya aja, itu yang dipakai di `CLOUDFLARE_TUNNEL_TOKEN` pada `.env`
4. Di tab **Public Hostname** tunnel itu, tambahkan dua route:
   - `domainmu.com` → service `http://traefik:80`
   - `api.domainmu.com` → service `http://traefik:80`
   
   (Nanti nambah app baru, misal `app.domainmu.com`, tinggal tambah route lagi di sini, tetap arahnya ke `http://traefik:80` — Traefik yang nentuin diterusin ke container mana berdasarkan subdomain.)

## 2. Clone & konfigurasi di homeserver
```bash
git clone <url-repo-ini> portofolio
cd portofolio

docker network create edge   # sekali aja, network bersama buat semua service di homeserver ini

cp .env.example .env
cp backend/.env.example backend/.env
# edit .env dan backend/.env: DOMAIN, DB_PASSWORD, CLOUDFLARE_TUNNEL_TOKEN, APP_KEY, dst
# DB_DATABASE/DB_USERNAME/DB_PASSWORD di .env dan backend/.env harus SAMA

php artisan key:generate   # kalau ada PHP lokal; kalau nggak, generate APP_KEY manual atau lewat container sekali jalan
```

## 3. Jalankan
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Cek status:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

Beberapa menit setelah tunnel route aktif, `https://domainmu.com` dan `https://api.domainmu.com/api/health` harusnya udah bisa diakses.

## 4. Update setelah ada perubahan code
```bash
cd portofolio
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```
`entrypoint.sh` backend otomatis jalanin migration (`php artisan migrate --force`) tiap restart container — aman karena migration Laravel idempotent (skip yang udah jalan).

## 5. Backup database
Service `db-backup` jalan otomatis tiap hari (`@daily`), nyimpen dump ke `./backups` di homeserver dengan rotasi 7 hari/4 minggu/6 bulan (lihat `docker-compose.prod.yml`).

**Penting:** itu baru rotasi lokal — kalau disk homeserver rusak, backup ikut hilang. Setidaknya sesekali salin folder `./backups` ke tempat lain (external drive, cloud storage via `rclone`, dll). Ini belum diotomatisasi di scaffold ini — jadi catatan todo buat Fase 7.

## 6. Restore database (kalau perlu)
```bash
docker compose -f docker-compose.prod.yml exec -T db psql -U $DB_USERNAME -d $DB_DATABASE < backups/daily/nama_file.sql
```

## Menambah app baru nanti (misal todo list di app.domainmu.com)
1. Tambah route hostname baru di Cloudflare Tunnel (arahnya tetap ke `http://traefik:80`)
2. Tambah service baru di compose (bisa di file ini atau compose terpisah yang nyambung ke network `edge` yang sama), dengan label Traefik:
   ```yaml
   labels:
     - traefik.enable=true
     - traefik.http.routers.todo.rule=Host(`app.domainmu.com`)
     - traefik.http.routers.todo.entrypoints=web
     - traefik.http.services.todo.loadbalancer.server.port=80
   ```
3. `docker compose up -d --build` — selesai, nggak perlu ubah config Traefik/cloudflared yang lain.
