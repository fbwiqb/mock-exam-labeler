const path = require("path");
const { rcedit } = require("rcedit");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;
  const exe = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  const icon = path.join(__dirname, "..", "assets", "icon.ico");
  await rcedit(exe, { icon });
};
