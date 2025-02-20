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
      // For production, consider setting nodeIntegration to false and using a preload script.
      nodeIntegration: true,
      contextIsolation: false
    },
    resizable: false
  });

  // Load the Vite dev server URL in development or the local index.html file in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle clipboard operations
ipcMain.handle('copy-to-clipboard', async (_, text) => {
  clipboard.writeText(text);
  return true;
});

// Handle 1Password CLI operations
ipcMain.handle('save-to-1password', async (_, { title, username, password }) => {
  try {
    // Extend the environment PATH to include common directories where 'op' might be installed
    const env = {
      ...process.env,
      PATH: process.env.PATH + ":/usr/local/bin:/opt/homebrew/bin"
    };

    // Dynamically locate the 1Password CLI using 'which op' with the extended PATH
    const { stdout: opPath } = await execAsync('which op', { env });
    const opExecutable = opPath.trim();
    if (!opExecutable) {
      throw new Error("1Password CLI not found. Please ensure it is installed and in your PATH.");
    }

    // Build the command using assignment syntax for username and password
    const command = `"${opExecutable}" item create --category=login --title="${title}" username="${username}" password="${password}"`;

    // Execute the command with the extended environment
    const { stdout } = await execAsync(command, { env });
    return { success: true, data: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
