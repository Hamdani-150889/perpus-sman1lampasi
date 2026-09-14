/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - BACKEND CLOUD DATABASE PUSTAKA SMAN 1 LAMPASIO
 * =========================================================================
 * 
 * Panduan Singkat Pemasangan:
 * 1. Buka Google Sheets baru di Google Drive (https://sheets.new)
 * 2. Beri nama spreadsheet: "Database Pustaka SMAN 1 LAMPASIO"
 * 3. Klik menu "Ekstensi" > "Apps Script"
 * 4. Hapus semua kode yang ada di editor Apps Script, lalu salin (paste) seluruh kode berkas ini.
 * 5. Klik "Simpan" (ikon disket).
 * 6. Klik tombol "Terapkan" (Deploy) di kanan atas > "Deployment baru" (New deployment).
 * 7. Pada roda gigi (Select type), pilih "Aplikasi Web" (Web app).
 * 8. Konfigurasi deployment:
 *    - Deskripsi: Versi 1 Database Pustaka
 *    - Jalankan sebagai (Execute as): "Saya" (Me - email akun Google Anda)
 *    - Siapa yang memiliki akses (Who has access): "Siapa saja" (Anyone) -> PENTING agar web app bisa menyimpan data.
 * 9. Klik "Terapkan" (Deploy) dan berikan izin akses saat diminta Google.
 * 10. Salin "URL Aplikasi Web" (akhiran /exec) dan tempelkan di menu Pengaturan Cloud pada aplikasi Pustaka.
 */

// Inisialisasi atau ambil sheet berdasarkan nama
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#3b82f6");
      headerRange.setFontColor("#ffffff");
    }
  }
  return sheet;
}

// Handler HTTP GET: Mengambil semua data buku, anggota, dan peminjaman
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Ambil Data Buku
    var bookSheet = getOrCreateSheet(ss, "Buku", [
      "id", "title", "author", "publisher", "category", "isbn", "stock", "availableStock", "description", "coverColor", "createdAt"
    ]);
    var books = getSheetDataAsJson(bookSheet);

    // 2. Ambil Data Anggota
    var memberSheet = getOrCreateSheet(ss, "Anggota", [
      "id", "name", "email", "phone", "joinDate", "status"
    ]);
    var members = getSheetDataAsJson(memberSheet);

    // 3. Ambil Data Peminjaman
    var borrowingSheet = getOrCreateSheet(ss, "Peminjaman", [
      "id", "bookId", "memberId", "borrowDate", "dueDate", "returnDate", "fine", "status"
    ]);
    var borrowings = getSheetDataAsJson(borrowingSheet);

    var result = {
      status: "success",
      message: "Data berhasil diambil dari Google Sheets",
      timestamp: new Date().toISOString(),
      data: {
        books: books,
        members: members,
        borrowings: borrowings
      }
    };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errorResult = {
      status: "error",
      message: err.toString()
    };
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handler HTTP POST: Menyimpan / menyinkronkan data buku, anggota, atau peminjaman
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData = {};

    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    }

    var action = postData.action || "syncAll";

    // Simpan Buku jika ada
    if (action === "syncAll" || action === "saveBooks") {
      if (postData.books && Array.isArray(postData.books)) {
        var bookHeaders = ["id", "title", "author", "publisher", "category", "isbn", "stock", "availableStock", "description", "coverColor", "createdAt"];
        var bookSheet = getOrCreateSheet(ss, "Buku", bookHeaders);
        replaceSheetData(bookSheet, bookHeaders, postData.books);
      }
    }

    // Simpan Anggota jika ada
    if (action === "syncAll" || action === "saveMembers") {
      if (postData.members && Array.isArray(postData.members)) {
        var memberHeaders = ["id", "name", "email", "phone", "joinDate", "status"];
        var memberSheet = getOrCreateSheet(ss, "Anggota", memberHeaders);
        replaceSheetData(memberSheet, memberHeaders, postData.members);
      }
    }

    // Simpan Peminjaman jika ada
    if (action === "syncAll" || action === "saveBorrowings") {
      if (postData.borrowings && Array.isArray(postData.borrowings)) {
        var borrowingHeaders = ["id", "bookId", "memberId", "borrowDate", "dueDate", "returnDate", "fine", "status"];
        var borrowingSheet = getOrCreateSheet(ss, "Peminjaman", borrowingHeaders);
        replaceSheetData(borrowingSheet, borrowingHeaders, postData.borrowings);
      }
    }

    var result = {
      status: "success",
      message: "Data berhasil disinkronkan ke Google Sheets",
      timestamp: new Date().toISOString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errorResult = {
      status: "error",
      message: err.toString()
    };
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi bantu membaca data sheet menjadi Array of Object (JSON)
function getSheetDataAsJson(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  if (lastRow <= 1 || lastCol < 1) {
    return [];
  }

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    var hasContent = false;
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      obj[headers[j]] = val !== undefined && val !== null ? val : "";
      if (obj[headers[j]] !== "") hasContent = true;
    }
    if (hasContent) {
      result.push(obj);
    }
  }

  return result;
}

// Fungsi bantu menimpa seluruh data sheet dengan data baru dari aplikasi
function replaceSheetData(sheet, headers, items) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (!items || items.length === 0) {
    return;
  }

  var rows = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var val = item[headers[j]];
      if (val === undefined || val === null) {
        val = "";
      }
      row.push(val);
    }
    rows.push(row);
  }

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}
