// lib/users.ts
// Users are stored in a "Users" tab of the same Google Sheet used for logging.
// Columns: A=id  B=email  C=name  D=role  E=passwordHash  F=createdAt  G=active
import { google } from 'googleapis'
import bcrypt from 'bcryptjs'

const SHEET_ID = process.env.GOOGLE_SHEET_ID || ''
const USERS_SHEET = 'Users'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  passwordHash: string
  createdAt: string
  active: boolean
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

async function ensureUsersSheetExists(sheets: any) {
  // Check if "Users" tab exists; if not, create it with header row
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const exists = meta.data.sheets?.some(
    (s: any) => s.properties?.title === USERS_SHEET
  )
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: USERS_SHEET } } }],
      },
    })
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${USERS_SHEET}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['id', 'email', 'name', 'role', 'passwordHash', 'createdAt', 'active']],
      },
    })
  }
}

async function readAllRows(sheets: any): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${USERS_SHEET}!A2:G10000`,
  })
  return res.data.values || []
}

function rowToUser(row: string[]): User {
  return {
    id: row[0],
    email: row[1],
    name: row[2],
    role: (row[3] as 'admin' | 'user') || 'user',
    passwordHash: row[4],
    createdAt: row[5],
    active: row[6] === 'TRUE' || row[6] === 'true' || row[6] === '1',
  }
}

async function ensureAdminSeed(sheets: any) {
  const rows = await readAllRows(sheets)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@patrika.com'
  const exists = rows.some(r => (r[1] || '').toLowerCase() === adminEmail.toLowerCase())
  if (!exists) {
    const adminPass = process.env.ADMIN_PASSWORD || 'Admin@1234'
    const hash = bcrypt.hashSync(adminPass, 10)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${USERS_SHEET}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          'admin-001', adminEmail, 'Administrator', 'admin', hash,
          new Date().toISOString(), 'TRUE',
        ]],
      },
    })
  }
}

export async function getUsers(): Promise<User[]> {
  const sheets = await getSheetsClient()
  await ensureUsersSheetExists(sheets)
  await ensureAdminSeed(sheets)
  const rows = await readAllRows(sheets)
  return rows.filter(r => r[1]).map(rowToUser)
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user || !user.active) return null
  if (!bcrypt.compareSync(password, user.passwordHash)) return null
  return user
}

export async function createUser(data: {
  email: string; name: string; role: 'admin' | 'user'; password: string
}): Promise<User> {
  const sheets = await getSheetsClient()
  await ensureUsersSheetExists(sheets)
  const existing = await findUserByEmail(data.email)
  if (existing) throw new Error('Email already exists')

  const user: User = {
    id: `user-${Date.now()}`,
    email: data.email,
    name: data.name,
    role: data.role,
    passwordHash: bcrypt.hashSync(data.password, 10),
    createdAt: new Date().toISOString(),
    active: true,
  }
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${USERS_SHEET}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        user.id, user.email, user.name, user.role, user.passwordHash,
        user.createdAt, 'TRUE',
      ]],
    },
  })
  return user
}

async function findUserRowIndex(sheets: any, id: string): Promise<number> {
  const rows = await readAllRows(sheets)
  const idx = rows.findIndex(r => r[0] === id)
  return idx === -1 ? -1 : idx + 2 // +2 because data starts at row 2 (1-indexed)
}

export async function updateUserStatus(id: string, active: boolean) {
  const sheets = await getSheetsClient()
  const rowNum = await findUserRowIndex(sheets, id)
  if (rowNum === -1) return
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${USERS_SHEET}!G${rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[active ? 'TRUE' : 'FALSE']] },
  })
}

export async function deleteUser(id: string) {
  const sheets = await getSheetsClient()
  // Find the sheetId (gid) for Users tab
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const usersSheet = meta.data.sheets?.find(
    (s: any) => s.properties?.title === USERS_SHEET
  )
  if (!usersSheet) return
  const sheetGid = usersSheet.properties.sheetId

  const rowNum = await findUserRowIndex(sheets, id)
  if (rowNum === -1) return

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetGid,
            dimension: 'ROWS',
            startIndex: rowNum - 1,
            endIndex: rowNum,
          },
        },
      }],
    },
  })
}
