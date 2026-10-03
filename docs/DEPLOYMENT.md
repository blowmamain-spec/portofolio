# Deployment ke Homeserver

Domain: **nfab.my.id** (dibeli di Rumahweb). Homeserver udah ada Docker — jadi runbook ini langsung mulai dari DNS, nggak ada step install OS/Docker.

Deploy manual (git pull + docker compose up) — pilihan sadar di awal buat belajar tiap step-nya, bukan auto-deploy CI/CD.

## Prasyarat
- [x] Docker + Docker Compose di homeserver (udah ada)
- [x] Domain nfab.my.id (udah dibeli di Rumahweb)
- [ ] Akun Cloudflare (gratis) — buat di [cloudflare.com](https://dash.cloudflare.com/sign-up) kalau belum punya

---

## 1. Pindahin DNS nfab.my.id ke Cloudflare

Kenapa: Cloudflare Tunnel (step 3) butuh domain yang DNS-nya dikelola Cloudflare. Rumahweb tetap jadi tempat kamu *memperpanjang* domain tiap tahun — cuma nameserver-nya yang pindah ke Cloudflare.

1. Login ke [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a Site** → masukkan `nfab.my.id` → pilih paket **Free**
2. Cloudflare scan DNS record yang ada (kemungkinan kosong/default dari Rumahweb) — biarkan aja, record yang dibutuhkan buat Tunnel otomatis dibikin nanti di step 3
3. Cloudflare kasih 2 nameserver, bentuknya kira-kira `xxx.ns.cloudflare.com` dan `yyy.ns.cloudflare.com` — catat keduanya
4. Login ke **member area Rumahweb** → menu domain `nfab.my.id` → cari **Kelola DNS / Nameserver** → ganti nameserver default Rumahweb dengan 2 nameserver Cloudflare dari step 3
   - Kalau Rumahweb nggak ngasih opsi ganti nameserver sendiri (kadang domain `.my.id` dikunci ke nameserver default), hubungi live chat/CS Rumahweb minta diubah ke custom nameserver — ini permintaan umum, biasanya diproses cepat
5. Tunggu propagasi. Biasanya beberapa menit sampai beberapa jam (domain `.id`/`.my.id` kadang lebih lambat dari `.com`, bisa sampai 24 jam). Cloudflare otomatis kirim email begitu statusnya aktif — nggak perlu dicek manual terus-terusan

**Cek status aktif:**
```bash
dig NS nfab.my.id +short
```
Kalau hasilnya udah nunjuk ke nameserver Cloudflare, lanjut ke step 2. Belum? Tunggu dulu, propagasi DNS emang gitu — nggak perlu diulang-ulang.

---

## 2. Clone & konfigurasi di homeserver

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

## 3. Bikin Cloudflare Tunnel (lewat CLI, bukan dashboard)

Cara biasa (dashboard Zero Trust → Create a tunnel) sekarang minta aktivasi Zero Trust yang mewajibkan kartu/PayPal on-file, meskipun gratis. Runbook ini pakai cara lama: bikin tunnel lewat **CLI `cloudflared`**, yang nggak lewat Zero Trust sama sekali — tinggal login pakai akun Cloudflare biasa (email+password/Google, nggak perlu kartu).

Semua command di bawah dijalanin di dalam folder `portofolio` (hasil clone step 2), pakai image `cloudflared` sekali-pakai (`docker run --rm`) — nggak perlu install apa-apa permanen.

```bash
mkdir -p cloudflared
chmod 777 cloudflared
```

> **Catatan path:** image resmi `cloudflared` jalan sebagai user `nonroot`, home directory-nya `/home/nonroot` — **bukan** `/root`. Semua command di bawah mount ke `/home/nonroot/.cloudflared`. Kalau salah mount ke `/root/.cloudflared`, filenya ketulis di dalam container doang dan ikut hilang pas container `--rm` keluar (cert "berhasil login" tapi nggak pernah nyampe ke host).
>
> **Catatan permission:** `chmod 777` di atas disengaja, bukan typo. UID user `nonroot` di dalam image beda dari user manapun di host (root termasuk), jadi folder `cloudflared/` perlu writable buat semua biar container-nya bisa nulis `cert.pem`/credential ke situ. Ini folder lokal kecil yang isinya cuma dibaca proses `cloudflared`, jadi risikonya minim — tapi kalau mau lebih ketat, cek UID user `nonroot` di image (`docker run --rm cloudflare/cloudflared:latest id`) terus `chown` folder ini ke UID itu sebagai gantinya.

**3.1 Login** — ini bakal nge-print sebuah URL:
```bash
docker run --rm -it -v "$PWD/cloudflared":/home/nonroot/.cloudflared cloudflare/cloudflared:latest tunnel login
```
Buka URL itu di browser manapun (HP/laptop, nggak harus di homeserver), login ke akun Cloudflare yang domainnya udah di-add (step 1), pilih `nfab.my.id`, klik **Authorize**. Tunggu sampai terminal nampilin "You have successfully logged in" dan command-nya berhenti sendiri (jangan Ctrl+C). Cek hasilnya:
```bash
ls -la cloudflared/   # harus ada cert.pem
```

**3.2 Bikin tunnel:**
```bash
docker run --rm -v "$PWD/cloudflared":/home/nonroot/.cloudflared cloudflare/cloudflared:latest tunnel create nfab-homeserver
```
Catat **Tunnel ID** yang muncul di output (bentuknya UUID, misal `a1b2c3d4-...`). File credential `<tunnel-id>.json` otomatis tersimpan di `cloudflared/`.

**3.3 Arahin DNS ke tunnel ini:**
```bash
docker run --rm -v "$PWD/cloudflared":/home/nonroot/.cloudflared cloudflare/cloudflared:latest tunnel route dns nfab-homeserver nfab.my.id
docker run --rm -v "$PWD/cloudflared":/home/nonroot/.cloudflared cloudflare/cloudflared:latest tunnel route dns nfab-homeserver api.nfab.my.id
```
Ini otomatis bikin CNAME record di Cloudflare, nggak perlu ke dashboard sama sekali.

**3.4 Bikin config** — buat file `cloudflared/config.yml` isinya (ganti `<TUNNEL_ID>` dengan ID dari step 3.2):
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /home/nonroot/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: nfab.my.id
    service: http://traefik:80
  - hostname: api.nfab.my.id
    service: http://traefik:80
  - service: http_status:404   # wajib ada, baris terakhir — fallback buat hostname lain
```

Hasil akhir folder `cloudflared/` isinya 3 file: `cert.pem`, `<TUNNEL_ID>.json`, `config.yml`. **Folder ini udah di-gitignore — jangan pernah commit**, isinya credential buat akses tunnel kamu.

*(Nanti nambah app baru, misal `app.nfab.my.id` buat todo list: `tunnel route dns nfab-homeserver app.nfab.my.id` lagi, terus tambah satu baris di `ingress:` pada `config.yml` sebelum baris `http_status:404`, lalu `docker compose restart cloudflared`.)*

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
1. `docker run --rm -v "$PWD/cloudflared":/home/nonroot/.cloudflared cloudflare/cloudflared:latest tunnel route dns nfab-homeserver app.nfab.my.id`
2. Tambah satu baris hostname baru di `cloudflared/config.yml` (sebelum baris `http_status:404`), lalu `docker compose -f docker-compose.prod.yml restart cloudflared`
3. Tambah service baru di compose (bisa di file ini atau compose terpisah yang nyambung ke network `edge` yang sama), dengan label Traefik:
   ```yaml
   labels:
     - traefik.enable=true
     - traefik.http.routers.todo.rule=Host(`app.nfab.my.id`)
     - traefik.http.routers.todo.entrypoints=web
     - traefik.http.services.todo.loadbalancer.server.port=80
   ```
4. `docker compose up -d --build` — selesai.

## Troubleshooting umum
- **`docker network create edge` bilang network udah ada** — aman, berarti udah pernah dibikin sebelumnya, lanjut aja.
- **`tunnel login` kebuka tapi stuck nunggu** — pastikan browser yang dipakai authorize itu login ke akun Cloudflare yang sama dengan yang nambahin domain di step 1.
- **Tunnel nggak connect** (`cloudflared` logs nggak nunjukin `Registered tunnel connection`) — cek `config.yml` path `credentials-file`-nya bener (`/home/nonroot/.cloudflared/<TUNNEL_ID>.json`, bukan path di host), dan `docker compose ps` pastiin container `cloudflared` statusnya `Up`, bukan restart loop.
- **`ls cloudflared/` kosong abis `tunnel login`** — kemungkinan besar mount path salah (harus `/home/nonroot/.cloudflared`, bukan `/root/.cloudflared` — image `cloudflared` jalan sebagai user `nonroot`) atau command keburu di-Ctrl+C sebelum "You have successfully logged in" muncul. Ulangi step 3.1.
- **`permission denied` nulis `cert.pem` atau `<TUNNEL_ID>.json`** — folder `cloudflared/` di host belum writable buat UID `nonroot` di dalam container. `chmod 777 cloudflared` dulu (lihat catatan di step 3), baru ulangi command yang gagal.
- **cloudflared bilang `"cloudflared tunnel run" requires the ID or name of the tunnel ... or in the configuration file`** — `tunnel run` nggak otomatis nemu `config.yml` biarpun udah di-mount ke home directory yang bener. Compose file ini udah pakai `--config /home/nonroot/.cloudflared/config.yml` eksplisit buat ngehindarin ini; kalau masih muncul, cek command di `docker-compose.prod.yml` beneran ke-apply (`docker compose -f docker-compose.prod.yml up -d --build cloudflared` ulang).
- **cloudflared bilang `lookup cfd-features.argotunnel.com on 127.0.0.11:53: server misbehaving` / `Couldn't resolve SRV record`** — ini soal DNS resolver di dalam container, bukan soal domain `nfab.my.id` kamu (domain Cloudflare sendiri yang gagal di-resolve). Biasanya karena resolver default Docker (`127.0.0.11`) nggak bisa nyampe ke upstream DNS host (sering kejadian kalau host pakai `systemd-resolved`). Compose file ini udah set `dns: [1.1.1.1, 1.0.0.1]` eksplisit buat service `cloudflared` buat ngehindarin ini — pastikan udah `git pull` versi terbaru, lalu `docker compose -f docker-compose.prod.yml up -d --build cloudflared`.
- **Semua domain balik 404 meskipun tunnel udah connect dan DNS udah bener** — cek `docker compose -f docker-compose.prod.yml logs traefik`. Kalau isinya `Error response from daemon: client version 1.24 is too old`, berarti Traefik gagal connect ke Docker API-nya sama sekali (jadi dia nggak pernah "liat" container frontend/backend-nya, semua request jatuh ke 404 default). Ini [bug dikenal luas](https://github.com/appwrite/appwrite/issues/10801) — Traefik versi di bawah v3.6.1 hardcode API version lama yang ditolak Docker Engine baru (29.x+). Fix: pakai image `traefik:v3.6` (sudah di-pin di compose file ini), **bukan** env var `DOCKER_API_VERSION` (sempat dicoba duluan, ternyata Traefik nggak baca env var itu sama sekali). `git pull` versi terbaru lalu `docker compose -f docker-compose.prod.yml up -d --build traefik`.
- **Domain nggak resolve sama sekali di host (`curl: Could not resolve host`), padahal `dig @1.1.1.1` udah bener** — ini bukan soal propagasi/record, tapi resolver DNS default host-mu yang nggak ke-konfigurasi (`cat /etc/resolv.conf` nunjukin "No DNS servers known"). Set manual:
  ```bash
  sudo mkdir -p /etc/systemd/resolved.conf.d
  sudo tee /etc/systemd/resolved.conf.d/dns.conf <<'EOF'
  [Resolve]
  DNS=1.1.1.1 1.0.0.1 8.8.8.8
  FallbackDNS=8.8.8.8 1.1.1.1
  EOF
  sudo systemctl restart systemd-resolved
  ```
- **Backend crash-loop, log-nya `password authentication failed for user "portofolio"`** — image Postgres cuma nge-set password itu **sekali**, pas volume datanya pertama kali dibuat. Kalau kamu ubah `DB_PASSWORD` di `.env`/`backend/.env` SETELAH container `db` pernah jalan, password di dalam database nggak otomatis ikut berubah. Samain manual:
  ```bash
  docker compose -f docker-compose.prod.yml exec db psql -U portofolio -d portofolio -c "ALTER USER portofolio WITH PASSWORD 'isi_DB_PASSWORD_di_env_kamu';"
  docker compose -f docker-compose.prod.yml restart backend
  ```
  (Kalau ini masih instalasi baru dan belum ada data penting, alternatif lebih simpel: `docker compose -f docker-compose.prod.yml down -v` lalu `up -d --build` lagi — volume ke-reset bersih, password dari `.env` kepake dari awal.)
- **`https://nfab.my.id` kasih error 502/503** — tunnel-nya nyambung tapi Traefik/frontend container belum ready. Cek `docker compose ps` semua service status `Up`, dan `docker compose logs frontend`.
- **`/api/health` CORS error dari browser console** — pastikan `FRONTEND_URL` di `backend/.env` persis `https://nfab.my.id` (tanpa trailing slash), lalu `docker compose up -d --build backend` ulang.
