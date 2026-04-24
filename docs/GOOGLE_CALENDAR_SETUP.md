# Google Calendar Setup

Google Calendar di project ini menggunakan Appwrite Function dengan server-side OAuth. Scope yang dipakai hanya read-only:

- `https://www.googleapis.com/auth/calendar.readonly`

Event dibaca dari `primary` calendar user. Refresh token disimpan di backend Appwrite agar user tetap terkoneksi lintas browser session.

## 1. Google Cloud setup

1. Buka Google Cloud Console dan pilih project yang akan dipakai.
2. Enable `Google Calendar API`.
3. Setup `OAuth consent screen`.
4. Buat `OAuth Client ID` dengan type `Web application`.
5. Tambahkan `Authorized JavaScript origins`:
   - `http://localhost:5174`
   - `http://127.0.0.1:5174`
   - domain production app Anda, misalnya `https://app.your-domain.com`
6. Tambahkan `Authorized redirect URIs`:
   - URL callback Appwrite Function Anda, misalnya `https://google-calendar.functions.your-domain.com/oauth/callback`

Catatan:

- Flow backend ini memakai `client secret` di Appwrite Function env, bukan di frontend.
- Jika origin atau redirect URI belum di-whitelist, connect akan gagal saat user authorize di Google.

## 2. Frontend environment variables

Frontend hanya butuh ID function Appwrite:

```env
VITE_GOOGLE_CALENDAR_FUNCTION_ID="google-calendar"
```

Frontend Appwrite env tetap diperlukan:

```env
VITE_APPWRITE_ENDPOINT="https://appwrite.your-domain.com/v1"
VITE_APPWRITE_PROJECT_ID="your_project_id"
VITE_APPWRITE_DATABASE_ID="your_database_id"
```

Gunakan:

- `.env.local` untuk local development
- environment variables di platform deploy untuk production
- `.env.production.example` dan `.env.local.example` sebagai template frontend

## 3. Appwrite Function environment variables

Set di Appwrite Function `google-calendar`:

```env
APPWRITE_DATABASE_ID="your_database_id"
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
GOOGLE_REDIRECT_URI="https://google-calendar.functions.your-domain.com/oauth/callback"
GOOGLE_CALENDAR_APP_URL="https://app.your-domain.com"
GOOGLE_STATE_SECRET="a_long_random_secret"
```

Appwrite Function juga perlu scopes database read/write agar bisa menyimpan token.

## 4. Appwrite Function deployment

Buat function baru di Appwrite dengan rekomendasi berikut:

- Function ID: `google-calendar`
- Runtime: `Node.js`
- Root directory: `appwrite/functions/google-calendar`
- Entrypoint: `src/main.js`
- Build command: kosong
- Execute access: `Any`

Kenapa `Any`:

- Request callback dari Google ke function domain tidak membawa session Appwrite user.
- Validasi user tetap aman karena function memakai OAuth `state` yang ditandatangani (`GOOGLE_STATE_SECRET`) untuk mengikat callback ke user yang memulai connect.

Scopes minimum yang dibutuhkan function:

- database read
- database write

## 5. Appwrite collections

Selain field metadata di `profiles`, backend persistent OAuth juga butuh collection private:

- `google_calendar_connections`

Collection ini menyimpan refresh token dan access token terbaru untuk setiap user. Collection dibuat oleh bootstrap schema repo ini atau bisa dibuat manual di Appwrite.

## 6. In-app flow

1. User buka `Settings > Integrations`.
2. Klik `Connect Calendar`.
3. Frontend mengeksekusi Appwrite Function untuk mendapatkan Google authorization URL.
4. Google consent screen muncul.
5. Callback kembali ke Appwrite Function.
6. Function menukar authorization code menjadi refresh token + access token.
7. Setelah sukses, metadata koneksi disimpan ke collection `profiles`:
   - `google_calendar_connected`
   - `google_calendar_email`
   - `google_calendar_sync_source`
   - `google_calendar_connected_at`
8. Refresh token disimpan private di `google_calendar_connections`.
9. Widget `Meetings Scheduled` di dashboard membaca event melalui Appwrite Function.

## 7. Current limitations

- Integrasi ini read-only.
- Hanya membaca `primary` calendar.
- User tetap harus reconnect jika akses Google dicabut atau refresh token invalid.
- Appwrite Function harus tetap terdeploy dan env Google OAuth harus valid.

## 8. QA checklist

- Frontend dapat mengeksekusi function `google-calendar`.
- Connect berhasil dari `Settings > Integrations`.
- Event hari ini tampil di widget `Meetings Scheduled`.
- Pindah tanggal dengan panah kiri/kanan tetap memuat event.
- Disconnect mengembalikan widget ke state belum terhubung.
- Tutup browser lalu buka lagi: widget tetap bisa membaca event tanpa reconnect manual.
