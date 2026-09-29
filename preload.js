const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: true,
    guardarExcel: (bytes, sugerido) => ipcRenderer.invoke('guardar-excel', { bytes, sugerido }),
    abrirExcel: () => ipcRenderer.invoke('abrir-excel'),
    autoCargar: () => ipcRenderer.invoke('auto-cargar'),
    autoGuardar: (bytes) => ipcRenderer.invoke('auto-guardar', bytes)
});