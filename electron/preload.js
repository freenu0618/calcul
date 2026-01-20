/**
 * Preload 스크립트 - 보안 브릿지
 */

const { contextBridge, ipcRenderer } = require('electron');

// 안전한 API만 노출
contextBridge.exposeInMainWorld('electronAPI', {
    // 앱 정보
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // 파일 다이얼로그
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),

    // 알림
    showNotification: (title, body) => {
        new Notification(title, { body });
    }
});

console.log('Preload script loaded');
