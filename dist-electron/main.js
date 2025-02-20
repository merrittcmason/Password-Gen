import i, { app as t, BrowserWindow as a, ipcMain as c, clipboard as E } from "electron";
import { join as g } from "path";
import { fileURLToPath as v } from "url";
import { exec as y } from "child_process";
import { promisify as b } from "util";
if (typeof i == "string")
  throw new TypeError("Not running in an Electron environment!");
const { env: l } = process, P = "ELECTRON_IS_DEV" in l, T = Number.parseInt(l.ELECTRON_IS_DEV, 10) === 1, _ = P ? T : !i.app.isPackaged, s = b(y), x = v(new URL(".", import.meta.url));
let o;
function d() {
  o = new a({
    title: "Password Generator",
    width: 480,
    height: 800,
    webPreferences: {
      // For production, consider setting nodeIntegration to false and using a preload script.
      nodeIntegration: !0,
      contextIsolation: !1
    },
    resizable: !1
  }), _ ? (o.loadURL("http://localhost:5173"), o.webContents.openDevTools()) : o.loadFile(g(x, "../dist/index.html"));
}
t.whenReady().then(d);
t.on("window-all-closed", () => {
  process.platform !== "darwin" && t.quit();
});
t.on("activate", () => {
  a.getAllWindows().length === 0 && d();
});
c.handle("copy-to-clipboard", async (p, n) => (E.writeText(n), !0));
c.handle("save-to-1password", async (p, { title: n, username: m, password: w }) => {
  try {
    const e = {
      ...process.env,
      PATH: process.env.PATH + ":/usr/local/bin:/opt/homebrew/bin"
    }, { stdout: u } = await s("which op", { env: e }), r = u.trim();
    if (!r)
      throw new Error("1Password CLI not found. Please ensure it is installed and in your PATH.");
    const f = `"${r}" item create --category=login --title="${n}" username="${m}" password="${w}"`, { stdout: h } = await s(f, { env: e });
    return { success: !0, data: h };
  } catch (e) {
    return { success: !1, error: e.message };
  }
});
