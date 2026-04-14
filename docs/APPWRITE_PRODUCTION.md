# Appwrite Production Bootstrap

Dokumen ini melengkapi [docs/DEPLOY_VPS.md](/Users/macbookpro/Documents/Simplify Project/studio-simplify/docs/DEPLOY_VPS.md) dengan langkah bootstrap Appwrite untuk production.

## 1. Buat API key Appwrite

Setelah Appwrite aktif dan project sudah dibuat, buat API key dengan scope:

- `databases.read`
- `databases.write`
- `storage.read`
- `storage.write`
- `users.read`
- `users.write`

## 2. Bootstrap database, collection, dan bucket

Jalankan dari repo ini:

```bash
APPWRITE_ENDPOINT="https://appwrite.your-domain.com" \
APPWRITE_PROJECT_ID="your_project_id" \
APPWRITE_API_KEY="your_api_key" \
APPWRITE_DATABASE_ID="studio_manager" \
APPWRITE_DATABASE_NAME="Studio Manager" \
node scripts/bootstrap-appwrite.mjs
```

Yang dibuat:

- 1 database Appwrite
- bucket `task-attachments`
- collection production yang dipakai aplikasi

Script sumber:

- [scripts/appwrite.production.schema.mjs](/Users/macbookpro/Documents/Simplify Project/studio-simplify/scripts/appwrite.production.schema.mjs)
- [scripts/bootstrap-appwrite.mjs](/Users/macbookpro/Documents/Simplify Project/studio-simplify/scripts/bootstrap-appwrite.mjs)

## 3. Bootstrap owner pertama

Kalau user Appwrite owner sudah dibuat manual dari Appwrite console:

```bash
APPWRITE_ENDPOINT="https://appwrite.your-domain.com" \
APPWRITE_PROJECT_ID="your_project_id" \
APPWRITE_API_KEY="your_api_key" \
APPWRITE_DATABASE_ID="studio_manager" \
OWNER_USER_ID="user_id_di_appwrite" \
OWNER_EMAIL="owner@your-domain.com" \
OWNER_NAME="Owner Name" \
OWNER_POSITION="Co-Founder" \
node scripts/bootstrap-owner.mjs
```

Kalau mau sekalian buat user dari script:

```bash
APPWRITE_ENDPOINT="https://appwrite.your-domain.com" \
APPWRITE_PROJECT_ID="your_project_id" \
APPWRITE_API_KEY="your_api_key" \
APPWRITE_DATABASE_ID="studio_manager" \
OWNER_USER_ID="owner_primary" \
OWNER_EMAIL="owner@your-domain.com" \
OWNER_NAME="Owner Name" \
OWNER_PASSWORD="password_min_8_karakter" \
OWNER_CREATE_USER="true" \
node scripts/bootstrap-owner.mjs
```

Script ini memastikan data awal berikut ada:

- `profiles`
- `user_roles` dengan role `owner`
- `team_members`

## 4. Production notes

- `invitations.metadata`
- `graphic_design_briefs.logo_feelings`
- `ui_design_briefs.page_details`
- `task_activities.metadata`
- `task_activities.attachments`
- `notifications.data`

Disimpan sebagai **JSON string** supaya konsisten dengan schema Appwrite production.

## 5. Operational scripts

Script server yang disediakan:

- [deployment/vps-bootstrap.sh](/Users/macbookpro/Documents/Simplify Project/studio-simplify/deployment/vps-bootstrap.sh)
- [deployment/deploy-frontend.sh](/Users/macbookpro/Documents/Simplify Project/studio-simplify/deployment/deploy-frontend.sh)
- [deployment/backup-appwrite.sh](/Users/macbookpro/Documents/Simplify Project/studio-simplify/deployment/backup-appwrite.sh)
- [deployment/restore-appwrite.sh](/Users/macbookpro/Documents/Simplify Project/studio-simplify/deployment/restore-appwrite.sh)
