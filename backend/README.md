## OTT Backend (Node.js + Express + TypeScript + PostgreSQL)

This backend stores **metadata + HLS stream URLs** (no video files), and exposes admin CRUD APIs for:
- Movies (qualities + subtitles)
- Series → Seasons → Episodes (qualities + subtitles)
- Live TV Channels
- Football Matches (multiple servers)
- Users + Reseller model
- Subscription Plans
- Global App Settings

### Deploy on your VPS (no local install)

1. Install Docker + Docker Compose on the VPS.
2. Copy the `backend/` folder to the VPS.
3. From inside `backend/`, run:

```bash
docker compose up -d --build
```

4. Run Prisma migrations inside the container:

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma generate
```

### API base URL

- Health check: `GET /health`
- API base: `http://<your-vps>:8080/api`

### File uploads

Upload endpoint: `POST /api/uploads` (multipart form field name `file`)  
Returns a public URL you can save into `posterUrl`, `logoUrl`, etc.

### Production hardening notes

- Put this API behind **HTTPS** (CyberPanel/NGINX reverse proxy).
- Replace `JWT_SECRET` with a strong random secret.
- Set a strict `CORS_ORIGIN`.
- Add rate limiting + audit logs for the admin panel.

