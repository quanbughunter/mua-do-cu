// Nạp mã nguồn (không có DOM) vào một ngữ cảnh để kiểm thử.
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src');
const FILES = ['data-common.js', 'data-phone.js', 'data-headphones.js', 'data-camera.js', 'data-money.js', 'decode.js', 'engine.js'];
module.exports = function load(extra) {
  const code = FILES.map(f => fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n') + '\n' + (extra || '');
  const ctx = vm.createContext({ console, Date, Math, Intl, JSON });
  vm.runInContext(code + '\n;globalThis.__ = { CATEGORIES, PHONE, HEADPHONES, CAMERA, MONEY, DEFAULT_SETTINGS, newInspection, scoreInspection, valuate, insights, reportText, parseMoney, compStats, checkIMEI, decodeApplePartNo, simExpectation, checkAirpodsSet, parseCameraJpeg, matchCameraModel, fmtMoney, textOf, applicableItems, buildContext, referencePrice, interp, COS_CURVE, luhnCheckDigit, ratedShutter, findZipEntry, zipDataStart, galaxyBattScanner, galaxyBattSummary, decodeOneCode, decodeCodes, codeModelMismatch };', ctx, { filename: 'bundle.js' });
  return ctx.__;
};
