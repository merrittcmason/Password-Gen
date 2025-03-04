import { app, BrowserWindow, ipcMain, clipboard } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Password Generator',
    width: 480,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    resizable: false
  });
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
});

ipcMain.handle('copy-to-clipboard', async (_, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('save-to-1password', async (_, { title, username, password, website }) => {
  try {
    const env = { ...process.env, PATH: process.env.PATH + ":/usr/local/bin:/opt/homebrew/bin" };
    const { stdout: opPath } = await execAsync('which op', { env });
    const opExecutable = opPath.trim();
    if (!opExecutable) { throw new Error("1Password CLI not found. Please ensure it is installed and in your PATH."); }
    let command = `"${opExecutable}" item create --category=login --title="${title}" username="${username}" password="${password}"`;
    if (website && website.trim() !== "") { command += ` url="${website}"`; }
    const { stdout } = await execAsync(command, { env });
    return { success: true, data: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
