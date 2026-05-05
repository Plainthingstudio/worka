# Studio Simplify

Studio Simplify adalah aplikasi React + Vite untuk workflow studio, project tracking, dan dashboard operasional.

## Local development

Kebutuhan dasar:

- Node.js
- npm

Jalankan project:

```sh
npm i
npm run dev
```

Default local dev port di repo ini adalah `5174`, jadi origin lokal yang dipakai untuk integrasi browser adalah `http://localhost:5174`.

## Environment

Environment minimum untuk app:

```env
VITE_APPWRITE_ENDPOINT="https://appwrite.your-domain.com/v1"
VITE_APPWRITE_PROJECT_ID="your_project_id"
VITE_APPWRITE_DATABASE_ID="your_database_id"
VITE_ENABLE_DEMO_LOGIN="false"
VITE_DEV_PORT="5174"
```

Untuk Google Calendar persistent backend flow, tambahkan juga:

```env
VITE_GOOGLE_CALENDAR_FUNCTION_ID="google-calendar"
```

Lihat template:

- [.env.local.example](/Users/macbookpro/Documents/Simplify Project/studio-simplify/.env.local.example)
- [.env.production.example](/Users/macbookpro/Documents/Simplify Project/studio-simplify/.env.production.example)

## Google Calendar integration

Widget `Meetings Scheduled` di dashboard menggunakan Google Calendar read-only dari `primary` calendar user lewat Appwrite Function server-side OAuth.

Setup lengkap ada di:

- [docs/GOOGLE_CALENDAR_SETUP.md](/Users/macbookpro/Documents/Simplify Project/studio-simplify/docs/GOOGLE_CALENDAR_SETUP.md)

Ringkasan penting:

- Enable `Google Calendar API`
- Buat `OAuth Client ID` tipe `Web application`
- Deploy Appwrite Function `google-calendar`
- Tambahkan Appwrite Function callback URL ke Google OAuth redirect URIs
- Isi env function Google OAuth dan `VITE_GOOGLE_CALENDAR_FUNCTION_ID` di frontend
- Refresh token disimpan di backend, jadi user tidak perlu reconnect per browser session

## Build and deploy

Build production:

```sh
npm run build
```

Panduan deploy VPS:

- [docs/DEPLOY_VPS.md](/Users/macbookpro/Documents/Simplify Project/studio-simplify/docs/DEPLOY_VPS.md)
- [docs/PUSH_AND_PRODUCTION.md](/Users/macbookpro/Documents/Simplify Project/studio-simplify/docs/PUSH_AND_PRODUCTION.md)
