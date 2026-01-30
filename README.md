# EC2 Server – Next.js single-port app

One **Next.js** app that serves **frontend pages** and **backend APIs** on a single port. Designed for **AWS EC2** with **S3 image uploads** using an **IAM Role** (no Nginx, no reverse proxy, no access keys on the server).

## Features

- **Single port** – Next.js serves pages and API routes on one port (e.g. 3000).
- **S3 uploads** – `POST /api/upload` uploads images to S3 using the EC2 instance **IAM Role** (no `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`).
- **No Nginx** – Next.js handles everything on one process.

## Quick start

```bash
npm install
npm run build
# Set S3_BUCKET in .env (see below), then:
npm start
```

- **Frontend:** http://localhost:3000  
- **Health:** http://localhost:3000/api/health  
- **Upload:** `POST /api/upload` with form field `image` (multipart).

Development:

```bash
npm run dev
```

## Environment variables

| Variable      | Required | Description                                        |
|---------------|----------|----------------------------------------------------|
| `PORT`        | No       | Server port (Next.js default 3000)                 |
| `S3_BUCKET`   | Yes*     | S3 bucket name for uploads (*required for upload)  |
| `AWS_REGION`  | No       | AWS region (default `us-east-1`)                   |

Copy `env.example` to `.env` and set `S3_BUCKET`. On EC2 you do **not** need `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` if you use an IAM Role.

## AWS EC2 + S3 setup (IAM Role)

1. **Create an S3 bucket** (e.g. `my-app-uploads`) in the desired region.

2. **Create an IAM role for EC2:**
   - IAM → Roles → Create role.
   - Trusted entity: **AWS service** → **EC2**.
   - Attach a policy that allows S3 uploads. Example inline policy (replace `my-bucket-name`):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:PutObjectAcl"],
         "Resource": "arn:aws:s3:::my-bucket-name/uploads/*"
       }
     ]
   }
   ```

3. **Attach the role to your EC2 instance:**
   - EC2 → Instances → Select instance → Actions → Security → Modify IAM role → Choose the role → Save.

4. **On the EC2 server**, set env (e.g. in `.env` or systemd):
   - `S3_BUCKET=my-bucket-name`
   - `AWS_REGION=us-east-1` (or your bucket’s region)

5. **Security group:** Allow inbound TCP on your app port (e.g. 3000) or 80 if you use that as `PORT`.

6. **Run the app:**
   ```bash
   npm install
   npm run build
   npm start
   ```

The app uses the instance IAM role automatically; no credentials file or env keys are needed on the box.

## Project layout

```
├── app/
│   ├── layout.js
│   ├── page.js           # Home page with upload UI
│   ├── globals.css
│   └── api/
│       ├── health/route.js
│       └── upload/route.js
├── public/               # Static assets (optional)
├── next.config.js
├── env.example           # copy to .env
└── package.json
```

## API

| Method | Path           | Description                   |
|--------|----------------|-------------------------------|
| GET    | `/api/health`  | Health check                  |
| POST   | `/api/upload`  | Upload image (form: `image`)  |

Upload accepts JPEG, PNG, GIF, WebP; max 5MB. Returns `{ success, url, key }` on success.

## License

ISC
