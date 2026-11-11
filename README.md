# GSX Certificate Portal

This is a Node.js 20 + Express app. It uses `pdf-lib` to overlay a student's name onto a PDF template, avoiding a database and keeping the eligibility list on the server. The browser receives only a boolean and, for a valid match, a ten-minute HMAC-signed download token.

## Run locally

```powershell
cd certificate-app
npm install
Copy-Item .env.example .env
# Edit .env and replace TOKEN_SECRET with a long random value.
npm start
```

Open `http://localhost:3000`. For auto-reload during development, run `npm run dev`. Run checks with `npm test`.

`npm run generate-template` creates `assets/certificate_template.pdf` from the included design if it is absent. The server also generates it on first certificate request, so a deployment does not depend on a pre-generated binary. To replace the design, put your own one-page PDF at `assets/certificate_template.pdf` (or update `templatePath` in `config.json`). The supplied `certificate_template.svg` is the editable vector reference for the starter template.

## Student data

The live source is `data/students.csv`, generated from the supplied `GSX CERT.xlsx`. It is loaded once at server start and is never served to the browser. After updating the Excel workbook, regenerate the CSV and restart the service:

```powershell
npm run convert-students -- "..\GSX CERT.xlsx"
```

Keep the generated CSV headers as `name,enrollment_no`.

Matching ignores case and repeated/leading/trailing whitespace in names; enrollment numbers are trimmed but otherwise exact.

## Change name placement

Edit the `name` object in `config.json`:

- `y`: vertical position in PDF points from the bottom of the 794-point page.
- `font`: a `pdf-lib` standard font, such as `Helvetica-Bold` or `TimesRoman`.
- `size`: font size; it automatically shrinks for unusually long names.
- `color`: six-digit hexadecimal text color without `#`.

The x-position is centered automatically.

## Deploy (Render example)

1. Push the `certificate-app` directory to a Git repository (or use it as the repository root).
2. In Render, create a **Web Service** with build command `npm install` and start command `npm start`.
3. Set `TOKEN_SECRET` to a strong random secret and optionally set `ALLOWED_ORIGIN=https://gsx-gwalior-chapter.vercel.app`. Render supplies `PORT`; do not hardcode it.
4. Copy the resulting HTTPS URL, e.g. `https://certs-gsx.onrender.com`.
5. Set that URL in the main-site certificate-page button. The main site uses normal navigation, so no CORS configuration is needed.

Railway can use the same build/start commands.

### Deploy on Vercel

This project also includes the serverless entry point `api/index.js` and `vercel.json`. Import the repository in Vercel, set `TOKEN_SECRET` in Project Settings → Environment Variables, and deploy. `public/` is served as static content and `/api/*` is routed to the Express handler. Use the generated `https://…vercel.app` URL as `CERT_APP_URL` in the main site.

## Security notes

- `/api/verify` is limited to ten attempts per IP per 15 minutes.
- Tokens are HS256-HMAC signed and expire in ten minutes.
- Names and enrollment fields are length-limited server-side; generated filenames contain only a sanitized name.
- Logs contain only a timestamp and `found`/`not-found`, never student records.
- Do not commit `.env` or reuse the example secret in production.
