# Deploying To A VPS

This project runs best on one VPS with:

1. Appwrite for auth, database, and storage.
2. A static Vite frontend served from `dist/`.
3. Nginx in front of both app and Appwrite.

## Prerequisites

- Ubuntu/Debian VPS
- A domain with at least 2 subdomains pointed to the VPS
- `app.your-domain.com`
- `appwrite.your-domain.com`
- Node.js 20+
- Nginx
- A working Appwrite self-host install

## 1. Bootstrap the VPS

Use the provided bootstrap script:

```bash
sudo bash deployment/vps-bootstrap.sh
```

It installs Docker, Docker Compose plugin, Nginx, Certbot, Node.js 20, Git, and UFW.

## 2. Clone the project

```bash
cd /var/www
sudo git clone <your-repo-url> studio-simplify
sudo chown -R $USER:$USER /var/www/studio-simplify
cd /var/www/studio-simplify
npm install
```

## 3. Configure production frontend environment

Create a production env file from the example:

```bash
cp .env.production.example .env.production
```

Set these values in `.env.production`:

```env
VITE_APPWRITE_ENDPOINT=https://appwrite.your-domain.com/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_ENABLE_DEMO_LOGIN=false
```

Notes:

- `VITE_APPWRITE_ENDPOINT` must be reachable from the browser, not just from the VPS.
- If Appwrite is on the same VPS, put it behind HTTPS before using it in production.
- Because these are `VITE_` variables, they are embedded into the frontend build at build time.

## 4. Bootstrap Appwrite project resources

Use the production bootstrap guide:

- [docs/APPWRITE_PRODUCTION.md](/Users/macbookpro/Documents/Simplify Project/studio-simplify/docs/APPWRITE_PRODUCTION.md)

At minimum, complete:

1. Create Appwrite API key
2. Run `node scripts/bootstrap-appwrite.mjs`
3. Run `node scripts/bootstrap-owner.mjs`

## 5. Build the app

```bash
npm run build
```

The production files will be created in `dist/`.

## 6. Configure Nginx

Copy the provided configs:

```bash
sudo cp deployment/nginx-app.conf /etc/nginx/sites-available/studio-simplify-app
sudo cp deployment/nginx-appwrite.conf /etc/nginx/sites-available/studio-simplify-appwrite
```

Edit these values in the file:

- `server_name`
- `root`
- Appwrite upstream port in `deployment/nginx-appwrite.conf`

Then enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/studio-simplify-app /etc/nginx/sites-enabled/studio-simplify-app
sudo ln -s /etc/nginx/sites-available/studio-simplify-appwrite /etc/nginx/sites-enabled/studio-simplify-appwrite
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Enable HTTPS

Install Certbot and issue a certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.your-domain.com -d appwrite.your-domain.com
```

## 8. Updating the app

```bash
deployment/deploy-frontend.sh
```

Or manually:

```bash
cd /var/www/studio-simplify
git pull
npm install
npm run build
sudo systemctl reload nginx
```

## 9. Backups

Use the included backup script:

```bash
sudo bash deployment/backup-appwrite.sh
```

Restore from an archive with:

```bash
sudo bash deployment/restore-appwrite.sh /path/to/appwrite-backup.tar.gz
```

## Troubleshooting

### Auth page says Appwrite is not configured

Your build was created without real values for:

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_DATABASE_ID`

Update `.env.production`, then rebuild with `npm run build`.

### Deep links return 404

This is a single-page app. Make sure the Nginx config contains:

```nginx
try_files $uri $uri/ /index.html;
```

### Appwrite login fails in production

Check these in Appwrite:

- Your site domain is added to the Appwrite platform settings.
- The endpoint uses HTTPS.
- CORS/platform settings allow requests from your domain.
- The database and collection bootstrap scripts completed successfully.
