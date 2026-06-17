// lib/sheets.ts
import { google } from 'googleapis'

const SHEET_ID = process.env.GOOGLE_SHEET_ID || ''
const LOG_SHEET = 'Activity Log'

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

export interface ActivityLog {
  userEmail: string
  userName: string
  action: 'CALCULATE' | 'DOWNLOAD_EXCEL' | 'DOWNLOAD_PDF' | 'LOGIN'
  inputType: string
  amount: string
  pli: string
  state: string
  gross: string
  inhand: string
  inhandWithPLI: string
  ctc: string
  timestamp: string
}

export async function logActivity(log: ActivityLog) {
  if (!SHEET_ID) return // skip if not configured

  try {
    const sheets = await getSheets()

    // Ensure header row exists
    const header = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${LOG_SHEET}!A1:M1`,
    })

    if (!header.data.values?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${LOG_SHEET}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'Timestamp (IST)', 'User Email', 'User Name', 'Action',
            'State', 'Input Type', 'Amount (₹)', 'PLI (₹)',
            'Gross (₹)', 'In-Hand (₹)', 'In-Hand+PLI (₹)', 'Total CTC (₹)'
          ]]
        }
      })
    }

    // Append new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${LOG_SHEET}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          log.timestamp,
          log.userEmail,
          log.userName,
          log.action,
          log.state,
          log.inputType,
          log.amount,
          log.pli,
          log.gross,
          log.inhand,
          log.inhandWithPLI,
          log.ctc,
        ]]
      }
    })
  } catch (err) {
    console.error('Google Sheets log error:', err)
    // Don't throw — logging failure should not break app
  }
}
