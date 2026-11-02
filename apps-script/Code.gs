/**
 * basalt. — gravação do lead do Playbook SAP Activate.
 *
 * Cole este arquivo no Apps Script vinculado à planilha da marca.
 * O passo a passo está em PASSO-A-PASSO.md.
 *
 * SPREADSHEET_ID vazio: usa a planilha à qual o script está vinculado.
 * Preencha o ID só se o script for separado da planilha.
 */
var SPREADSHEET_ID = "";
var SHEET_NAME = "Leads";
var TIMEZONE = "America/Sao_Paulo";
var HEADERS = ["Data/hora", "E-mail", "Nome", "Aceite", "Versão do aceite"];

function doGet() {
  return json_({ ok: true, service: "basalt-leads" });
}

function doPost(e) {
  try {
    var data = parseBody_(e);
    if (String(data.hp_field || "").replace(/^\s+|\s+$/g, "") !== "") {
      return json_({ ok: true });
    }
    var email = String(data.email || "").replace(/^\s+|\s+$/g, "").toLowerCase();
    if (!isEmail_(email)) {
      return json_({ ok: false, error: "email" });
    }
    var name = String(data.name || "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    if (name.length > 120) name = name.substring(0, 120);
    var row = [
      Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss"),
      email,
      name,
      consentLabel_(data.consent),
      String(data.consentVersion || "").replace(/^\s+|\s+$/g, "").substring(0, 64)
    ];
    // getDocumentLock() devolve null num app da Web. O lock do script evita duas linhas ao mesmo tempo.
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet_();
      ensureHeader_(sheet);
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "gravacao" });
  }
}

function getSheet_() {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Nenhuma planilha. Vincule o script ou preencha SPREADSHEET_ID.");
  }
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }
  var current = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  var same = true;
  var empty = true;
  for (var i = 0; i < HEADERS.length; i++) {
    if (current[i] !== HEADERS[i]) same = false;
    if (current[i] !== "") empty = false;
  }
  if (same) return;
  if (empty) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}

function parseBody_(e) {
  var type = e && e.postData && e.postData.type ? String(e.postData.type) : "";
  if (type.indexOf("application/x-www-form-urlencoded") !== -1 && e.parameter) {
    return {
      email: e.parameter.email || "",
      name: e.parameter.name || "",
      consent: e.parameter.consent,
      consentVersion: e.parameter.consentVersion || "",
      hp_field: e.parameter.hp_field || ""
    };
  }
  var raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
  try {
    var data = JSON.parse(raw);
    return data || {};
  } catch (err) {
    return {};
  }
}

function isEmail_(value) {
  if (!value || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function consentLabel_(value) {
  if (value === true || value === "true" || value === "sim" || value === "1") return "sim";
  return "não";
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
