/**
 * ANIMAUX'26 — registrations → Google Sheet.
 *
 * Paste this into the sheet's Extensions → Apps Script editor, set SECRET,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Copy the web-app URL into Vercel as GOOGLE_SHEET_WEBHOOK_URL and the same
 * SECRET as GOOGLE_SHEET_SECRET. Full steps: docs/GO-LIVE-FOR-TESTING.md.
 *
 * Every registration is added to "All registrations" and to a tab named after
 * its event; help-desk messages go to "Help desk". Rows are only ever appended.
 */
const SECRET = "change-me-to-the-same-secret-as-vercel";

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad json" });
  }
  if (body.secret !== SECRET) return reply({ ok: false, error: "unauthorised" });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (body.kind === "registration") {
      append(ss, "All registrations", body.headers, body.row);
      append(ss, tabName(body.event), body.headers, body.row);
    } else if (body.kind === "enquiry") {
      append(ss, "Help desk", body.headers, body.row);
    } else {
      return reply({ ok: false, error: "unknown kind" });
    }
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/** Visiting the web-app URL in a browser shows this — a quick "is it deployed?" check. */
function doGet() {
  return reply({ ok: true, message: "ANIMAUX'26 sheet connector is running." });
}

function append(ss, name, headers, row) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#2a1e14").setFontColor("#f3e8d2");
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else {
    // New columns (e.g. a new event question) are added to the right of the header row.
    const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const missing = headers.filter((h) => existing.indexOf(h) === -1);
    if (missing.length) sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]).setFontWeight("bold");
    const all = existing.concat(missing);
    row = all.map((h) => {
      const i = headers.indexOf(h);
      return i === -1 ? "" : row[i];
    });
  }
  // Prefix values that a spreadsheet would treat as formulas.
  sheet.appendRow(row.map((v) => (typeof v === "string" && /^[=@]/.test(v) ? "'" + v : v)));
}

function tabName(event) {
  return String(event || "Unknown event").replace(/[\[\]\*\?\/\\:]/g, " ").replace(/\s+/g, " ").trim().slice(0, 90);
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
