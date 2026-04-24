# Manual Backup To MacBook

Panduan ini untuk backup manual Worka dari VPS ke MacBook.

## Yang dibackup

- Appwrite MariaDB dump
- Appwrite Docker volumes
- Appwrite config folder
- Worka production config
- Nginx site config
- Let's Encrypt renewal/live config
- Server info dan commit SHA app

Backup archive berisi data user/client dan secret. Jangan upload ke GitHub, chat, atau folder public.

## 1. Kirim script backup terbaru ke VPS

Jalankan dari Terminal MacBook:

```bash
cd "/Users/macbookpro/Documents/Simplify Project/studio-simplify"
scp deployment/backup-appwrite.sh ubuntu@103.93.129.191:/home/ubuntu/worka/deployment/backup-appwrite.sh
```

## 2. Jalankan backup di VPS

Masuk ke VPS:

```bash
ssh ubuntu@103.93.129.191
```

Lalu jalankan:

```bash
cd ~/worka
chmod +x deployment/backup-appwrite.sh
APPWRITE_DIR="$HOME/appwrite" APP_DIR="$HOME/worka" BACKUP_DIR="$HOME/backups/worka" bash deployment/backup-appwrite.sh
ls -lh ~/backups/worka
```

Catatan:

- Script akan membuat dump database dulu.
- Script akan stop Appwrite sebentar saat copy Docker volumes supaya backup lebih konsisten.
- Setelah selesai, script otomatis menjalankan Appwrite lagi.
- Kalau diminta password `sudo`, masukkan password VPS user `ubuntu`.

## 3. Download backup ke MacBook

Keluar dari VPS:

```bash
exit
```

Di Terminal MacBook, jalankan:

```bash
mkdir -p "$HOME/Documents/Worka-Backups"
scp 'ubuntu@103.93.129.191:/home/ubuntu/backups/worka/worka-manual-backup-*.tar.gz' "$HOME/Documents/Worka-Backups/"
ls -lh "$HOME/Documents/Worka-Backups"
```

## 4. Cek archive bisa dibaca

Ambil nama file backup terbaru:

```bash
latest_backup="$(ls -t "$HOME/Documents/Worka-Backups"/worka-manual-backup-*.tar.gz | head -1)"
tar -tzf "$latest_backup" | head -30
```

Kalau daftar file muncul, archive bisa dibaca.

## 5. Simpan aman

Minimal simpan:

- 1 copy di MacBook
- 1 copy tambahan di external drive atau cloud private

Jangan simpan backup ini di GitHub karena isinya bisa mengandung `.env`, database, file upload, dan secret.
