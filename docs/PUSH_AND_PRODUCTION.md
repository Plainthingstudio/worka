# Push And Production Checklist

Panduan ini dipakai setiap kali ingin mengirim perubahan Worka dari laptop ke GitHub lalu membuatnya live di production.

## Manual Terminal Policy

Kalau minta bantuan Codex untuk "push ke GitHub", "push ke production", atau "deploy production", Codex tidak perlu melakukan push/deploy langsung. Codex cukup memberikan command yang harus dijalankan manual satu per satu di terminal.

Gunakan command GitHub dan production di bawah ini sebagai jawaban standar.

### GitHub Only

```sh
cd "/Users/macbookpro/Documents/Simplify Project/studio-simplify"
git status
git push origin main
git log --oneline --decorate -3
git status --short --branch
```

### Production Only

Jalankan setelah commit terbaru sudah berhasil ada di GitHub.

```sh
ssh ubuntu@103.93.129.191
cd /home/ubuntu/worka
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
curl -s https://worka.plainthing.studio | grep assets/index
```

### GitHub Then Production

```sh
cd "/Users/macbookpro/Documents/Simplify Project/studio-simplify"
git status
git push origin main
git log --oneline --decorate -3
git status --short --branch
ssh ubuntu@103.93.129.191
cd /home/ubuntu/worka
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
curl -s https://worka.plainthing.studio | grep assets/index
```

## 1. Cek Perubahan Lokal

Masuk ke repo lokal:

```sh
cd "/Users/macbookpro/Documents/Simplify Project/studio-simplify"
git status
```

Pastikan perubahan yang terlihat memang ingin dikirim. Folder lokal agent seperti `.claude/` dan `.cursor/` tidak boleh ikut commit.

## 2. Stage Tanpa `.claude` Dan `.cursor`

Gunakan command ini untuk stage semua perubahan kecuali folder agent lokal:

```sh
git add . ':!.claude' ':!.cursor'
git status
```

Sebelum commit, cek bagian `Changes to be committed`. Jangan lanjut kalau `.claude/` atau `.cursor/` muncul di sana.

Kalau tidak sengaja sudah ter-stage, keluarkan lagi:

```sh
git restore --staged .claude .cursor
git status
```

## 3. Commit Ke Git Lokal

Ganti pesan commit sesuai isi perubahan:

```sh
git commit -m "Update production"
```

Kalau muncul `nothing to commit`, berarti tidak ada perubahan baru yang perlu di-commit.

## 4. Push Ke GitHub

```sh
git push origin main
```

Kalau diminta passphrase SSH, masukkan passphrase key laptop.

Verifikasi commit sudah ada di remote:

```sh
git log --oneline --decorate -3
git status --short --branch
```

Status yang sehat setelah push biasanya tidak menunjukkan `ahead`.

## 5. Deploy Ke Production VPS

Masuk VPS:

```sh
ssh ubuntu@103.93.129.191
```

Di VPS, pull versi terbaru lalu build:

```sh
cd /home/ubuntu/worka
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```

## 6. Verifikasi Production

Cek asset yang sedang diserve production:

```sh
curl -s https://worka.plainthing.studio | grep assets/index
```

Output akan berisi file asset seperti:

```html
<script type="module" crossorigin src="/assets/index-xxxxx.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-yyyyy.css">
```

Nama asset berubah setiap build. Itu normal. Yang penting command keluar dengan asset dari build terbaru dan halaman production bisa dibuka.

## 7. Quick Flow

Kalau sudah yakin perubahan siap:

```sh
cd "/Users/macbookpro/Documents/Simplify Project/studio-simplify"
git add . ':!.claude' ':!.cursor'
git status
git commit -m "Update production"
git push origin main
ssh ubuntu@103.93.129.191
cd /home/ubuntu/worka
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
curl -s https://worka.plainthing.studio | grep assets/index
```

## Notes

- Jangan commit secret baru ke repo. File `.env.production` boleh ada karena sudah menjadi bagian repo saat ini, tapi jangan menaruh API key rahasia baru tanpa sengaja.
- Jangan commit `.claude/` dan `.cursor/`; itu konfigurasi lokal agent/IDE.
- Kalau production tidak berubah setelah deploy, cek apakah `git push origin main` sudah sukses dan apakah VPS `git pull origin main` benar-benar menarik commit terbaru.
