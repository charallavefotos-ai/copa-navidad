const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function rutasBaseDatos() {
    const rutas = [path.join(app.getPath('userData'), 'BaseDatos_Torneo.xlsx')];
    try { rutas.push(path.join(path.dirname(app.getPath('exe')), 'BaseDatos_Torneo.xlsx')); } catch (e) {}
    return rutas;
}
function guardarBaseInterna(bytes) {
    try { fs.writeFileSync(path.join(app.getPath('userData'), 'BaseDatos_Torneo.xlsx'), Buffer.from(bytes)); } catch (e) {}
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1380, height: 920, minWidth: 940, minHeight: 640,
        backgroundColor: '#1e1b4b', autoHideMenuBar: true,
        webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
    });
    win.loadFile(path.join(__dirname, 'index.html'));
}

ipcMain.handle('guardar-excel', async (e, { bytes, sugerido }) => {
    const r = await dialog.showSaveDialog({ defaultPath: sugerido, filters: [{ name: 'Excel', extensions: ['xlsx'] }] });
    if (r.canceled || !r.filePath) return { ok: false };
    fs.writeFileSync(r.filePath, Buffer.from(bytes));
    guardarBaseInterna(bytes);
    return { ok: true, ruta: r.filePath };
});
ipcMain.handle('abrir-excel', async () => {
    const r = await dialog.showOpenDialog({ filters: [{ name: 'Excel', extensions: ['xlsx'] }], properties: ['openFile'] });
    if (r.canceled || !r.filePaths.length) return { ok: false };
    return { ok: true, bytes: new Uint8Array(fs.readFileSync(r.filePaths[0])) };
});
ipcMain.handle('auto-cargar', () => {
    for (const ruta of rutasBaseDatos()) {
        try { if (fs.existsSync(ruta)) return { ok: true, bytes: new Uint8Array(fs.readFileSync(ruta)) }; } catch (e) {}
    }
    return { ok: false };
});
ipcMain.handle('auto-guardar', (e, bytes) => guardarBaseInterna(bytes));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });