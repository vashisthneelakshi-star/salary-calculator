# Salary Breakup Calculator — Patrika Group

Login-protected internal tool with admin user management, automatically logs every calculation and download to a Google Sheet.

## 🏗️ Kya Bana Hai

- **Login page** — email/password se sign-in (NextAuth)
- **Admin Panel** (`/admin`) — naye users banao, activate/deactivate karo, delete karo
- **Calculator** — tumhara existing Salary Breakup Calculator, login ke peeche protected
- **Activity Logging** — jab koi calculate ya download (Excel/PDF) kare, woh automatically Google Sheet ke "Activity Log" tab mein save hota hai (kisne, kya, kab)
- **Users Database** — koi separate DB nahi; Google Sheet ka "Users" tab hi database hai

## 📋 Step-by-Step Setup (Pehli Baar)

### Step 1 — Google Sheet banao

1. Google Sheets pe ek nayi sheet banao (khali, kuch bhi naam do — e.g. "Salary Calc Data")
2. URL se Sheet ID nikalo: `https://docs.google.com/spreadsheets/d/`**`YEH_WALA_ID`**`/edit`
3. Isko `.env.local` mein `GOOGLE_SHEET_ID` ke aage paste karo

### Step 2 — Google Service Account banao (Sheets API access ke liye)

1. [Google Cloud Console](https://console.cloud.google.com/) pe jao
2. Nayi project banao (ya existing use karo)
3. "APIs & Services" → "Library" → "Google Sheets API" ko **Enable** karo
4. "APIs & Services" → "Credentials" → "Create Credentials" → "Service Account"
5. Service account banne ke baad, usme jao → "Keys" tab → "Add Key" → "Create new key" → **JSON** select karo → download ho jayega
6. Us JSON file mein:
   - `client_email` field copy karo → `.env.local` mein `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` field copy karo → `.env.local` mein `GOOGLE_PRIVATE_KEY` (quotes ke andar, `\n` waise hi rakhna)
7. **Important:** Apni Google Sheet kholo → "Share" button → us `client_email` (jo JSON mein tha) ko **Editor** access do

### Step 3 — Environment Variables set karo

```bash
cp .env.example .env.local
```

Phir `.env.local` file kholo aur fill karo:
- `NEXTAUTH_SECRET` — koi bhi random 32+ character string (terminal mein `openssl rand -base64 32` chala sakte ho)
- `NEXTAUTH_URL` — local pe `http://localhost:3000`, Vercel pe deploy karne ke baad apna live URL
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — pehla admin login (app pehli baar chalne par yeh user automatically Google Sheet mein ban jayega)
- `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` — Step 1-2 se

### Step 4 — Local test (optional)

```bash
npm install
npm run dev
```

Browser mein `http://localhost:3000` kholo → login screen aayegi → `ADMIN_EMAIL` / `ADMIN_PASSWORD` se login karo.

## 🚀 GitHub + Vercel Deploy

### GitHub pe upload

```bash
git init
git add .
git commit -m "Initial commit - Salary Breakup Calculator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**GitHub web editor se bhi kar sakte ho** (jaise tum normally karte ho): naya repo banao, sare files upload karo (`.env.local` MAT upload karna — woh `.gitignore` mein already excluded hai).

### Vercel pe Deploy

1. [vercel.com](https://vercel.com) pe jao → "Add New" → "Project"
2. Apna GitHub repo import karo
3. Deploy se pehle **Environment Variables** add karo (Vercel project settings mein):
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → apna Vercel URL (e.g. `https://salary-calc.vercel.app`) — pehle deploy karo, URL milne ke baad isko update karke redeploy karo
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
4. "Deploy" dabao

Deploy hone ke baad pehli baar `ADMIN_EMAIL`/`ADMIN_PASSWORD` se login karo, "Admin Panel" se naye users add karo.

## 📊 Google Sheet mein Kya Dikhega

Sheet automatically 2 tabs bana legi:

**Users tab** — sab logon ki list (admin panel yahin se padhta/likhta hai)

**Activity Log tab** — har calculate/download ka record:
| Timestamp | User Email | User Name | Action | State | Input Type | Amount | PLI | Gross | In-Hand | In-Hand+PLI | Total CTC |
|---|---|---|---|---|---|---|---|---|---|---|---|

`Action` column mein `LOGIN`, `CALCULATE`, `DOWNLOAD_EXCEL`, `DOWNLOAD_PDF` dikhega.

## 🔐 Roles

- **admin** — Admin Panel access, naye users bana sakta hai
- **user** — sirf calculator use kar sakta hai

## ⚠️ Important Notes

- Pehla admin (`ADMIN_EMAIL`) automatically ban jata hai jab koi pehli baar Google Sheet access karta hai — agar chaho to login karke naya admin banao aur purane ko delete kar do
- `.env.local` kabhi GitHub pe push nahi karna (already `.gitignore` mein hai)
- Formula Editor, PLI calculations, sab kuch waise hi kaam karega jaise pehle karta tha — sirf ab login + logging add hua hai
