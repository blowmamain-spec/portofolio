# Deployment ke Homeserver

Domain: **nfab.my.id** (dibeli di Rumahweb). Homeserver udah ada Docker — jadi runbook ini langsung mulai dari DNS, nggak ada step install OS/Docker.

Deploy manual (git pull + docker compose up) — pilihan sadar di awal buat belajar tiap step-nya, bukan auto-deploy CI/CD.

## Prasyarat
- [x] Docker + Docker Compose di homeserver (udah ada)
- [x] Domain nfab.my.id (udah dibeli di Rumahweb)
- [ ] Akun Cloudflare (gratis) — buat di [cloudflare.com](https://dash.cloudflare.com/sign-up) kalau belum punya

---

## 1. Pindahin DNS nfab.my.id ke Cloudflare

Kenapa: Cloudflare Tunnel (Fase 2) butuh domain yang DNS-nya dikelola Cloudflare. Rumahweb tetap jadi tempat kamu *memperpanjang* domain tiap tahun — cuma nameserver-nya yang pindah ke Cloudflare.

1. Login ke [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a Site** → masukkan `nfab.my.id` → pilih paket **Free**
2. Cloudflare scan DNS record yang ada (kemungkinan kosong/default dari Rumahweb) — biarkan aja, nanti record yang dibutuhkan (buat Tunnel) otomatis dibikin di step 2
3. Cloudflare kasih 2 nameserver, bentuknya kira-kira `xxx.ns.cloudflare.com` dan `yyy.ns.cloudflare.com` — catat keduanya
4. Login ke **member area Rumahweb** → menu domain `nfab.my.id` → cari **Kelola DNS / Nameserver** → ganti nameserver default Rumahweb dengan 2 nameserver Cloudflare dari step 3
   - Kalau Rumahweb nggak ngasih opsi ganti nameserver sendiri (kadang domain `.my.id` dikunci ke nameserver default), hubungi live chat/CS Rumahweb minta diubah ke custom nameserver — ini permintaan umum, biasanya diproses cepat
5. Tunggu propagasi. Biasanya beberapa menit sampai beberapa jam (domain `.id`/`.my.id` kadang lebih lambat dari `.com`, bisa sampai 24 jam). Cloudflare otomatis kirim email begitu statusnya aktif — nggak perlu dicek manual terus-terusan

**Cek status aktif:**
```bash
dig NS nfab.my.id +short
```
Kalau hasilnya udah nunjuk ke nameserver Cloudflare, lanjut ke step 2. Belum? Tunggu dulu, propagasi DNS emang gitu.

---

## 2. Bikin Cloudflare Tunnel

1. Masuk ke [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/) → **Networks → Tunnels** → **Create a tunnel**
2. Pilih connector **Cloudflared**, kasih nama misal `homeserver-nfab`
3. Di langkah **Install connector**, pilih tab **Docker** — Cloudflare kasih command yang isinya token panjang (`--token eyJhbGc...`). Kamu cuma butuh **tokennya aja** (bagian setelah `--token`), bukan command dockernya — token ini yang dipakai di `.env` sebagai `CLOUDFLARE_TUNNEL_TOKEN`
4. Lanjut ke tab **Public Hostname**, tambahkan dua route:

   | Subdomain | Domain | Type | URL |
   |---|---|---|---|
   | *(kosong)* | nfab.my.id | HTTP | `traefik:80` |
   | `api` | nfab.my.id | HTTP | `traefik:80` |

5. Save. Cloudflare otomatis bikinin DNS record yang diperlukan (CNAME ke tunnel) — nggak perlu nambah manual di tab DNS.

*(Nanti nambah app baru, misal `app.nfab.my.id` buat todo list, tinggal balik ke tab Public Hostname ini, tambah satu route lagi, arahnya tetap `traefik:80` — Traefik yang nentuin diterusin ke container mana.)*

---

## 3. Clone & konfigurasi di homeserver

```bash
git clone <url-repo-ini> portofolio
cd portofolio

# Kalau PR scaffold belum di-merge ke main, checkout branch-nya dulu:
# git checkout claude/youthful-albattani-ri9gbi

docker network create edge   # sekali aja, network bersama buat semua service homeserver ini

cp .env.example .env
cp backend/.env.example backend/.env
```

Edit `.env` (root):
```bash
DOMAIN=nfab.my.id
DB_DATABASE=portofolio
DB_USERNAME=portofolio
DB_PASSWORD=   # generate: openssl rand -base64 24
CLOUDFLARE_TUNNEL_TOKEN=   # token dari step 2.3
```

Edit `backend/.env` — samakan `DB_DATABASE`/`DB_USERNAME`/`DB_PASSWORD` persis dengan `.env` di atas, lalu:
```bash
FRONTEND_URL=https://nfab.my.id
APP_URL=https://api.nfab.my.id
APP_DEBUG=false
```

Generate `APP_KEY` (nggak perlu PHP terinstall di homeserver, pinjam image composer sekali jalan):
```bash
docker run --rm -v "$PWD/backend":/app -w /app composer:2 \
  php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```
Copy hasilnya ke `APP_KEY=...` di `backend/.env`.

---

## 4. Jalankan

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Cek status:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f cloudflared
```

## 5. Verifikasi

```bash
curl -I https://nfab.my.id
curl https://api.nfab.my.id/api/health
```
`/api/health` harusnya balas `{"status":"ok",...}`. Kalau belum bisa diakses, biasanya tunnel-nya masih connecting — cek `docker compose logs cloudflared`, tunggu baris `Registered tunnel connection`.

---

## 6. Update setelah ada perubahan code
```bash
cd portofolio
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```
`entrypoint.sh` backend otomatis jalanin migration (`php artisan migrate --force`) tiap restart container — aman karena migration Laravel idempotent (skip yang udah jalan).

## 7. Backup database
Service `db-backup` jalan otomatis tiap hari (`@daily`), nyimpen dump ke `./backups` di homeserver dengan rotasi 7 hari/4 minggu/6 bulan (lihat `docker-compose.prod.yml`).

**Penting:** itu baru rotasi lokal — kalau disk homeserver rusak, backup ikut hilang. Setidaknya sesekali salin folder `./backups` ke tempat lain (external drive, cloud storage via `rclone`, dll). Ini belum diotomatisasi di scaffold ini — jadi catatan todo buat Fase 7.

## 8. Restore database (kalau perlu)
```bash
docker compose -f docker-compose.prod.yml exec -T db psql -U $DB_USERNAME -d $DB_DATABASE < backups/daily/nama_file.sql
```

## Menambah app baru nanti (misal todo list di app.nfab.my.id)
1. Tambah route hostname baru di Cloudflare Tunnel, tab Public Hostname (arahnya tetap ke `http://traefik:80`)
2. Tambah service baru di compose (bisa di file ini atau compose terpisah yang nyambung ke network `edge` yang sama), dengan label Traefik:
   ```yaml
   labels:
     - traefik.enable=true
     - traefik.http.routers.todo.rule=Host(`app.nfab.my.id`)
     - traefik.http.routers.todo.entrypoints=web
     - traefik.http.services.todo.loadbalancer.server.port=80
   ```
3. `docker compose up -d --build` — selesai, nggak perlu ubah config Traefik/cloudflared yang lain.

## Troubleshooting umum
- **`docker network create edge` bilang network udah ada** — aman, berarti udah pernah dibikin sebelumnya, lanjut aja.
- **Tunnel status "Down" di Cloudflare dashboard** — cek `docker compose logs cloudflared`, biasanya token salah/ke-copy kurang lengkap, atau container belum start (cek `docker compose ps`).
- **`https://nfab.my.id` kasih error 502/503 dari Cloudflare** — tunnel-nya nyambung tapi Traefik/frontend container belum ready. Cek `docker compose ps` semua service status `Up`, dan `docker compose logs frontend`.
- **`/api/health` CORS error dari browser console** — pastikan `FRONTEND_URL` di `backend/.env` persis `https://nfab.my.id` (tanpa trailing slash), lalu `docker compose up -d --build backend` ulang.
