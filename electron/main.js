/**
 * Electron 메인 프로세스
 * 백엔드 exe 실행 및 프론트엔드 로딩
 */

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn, execFile } = require('child_process');

let mainWindow;
let backendProcess;

// 백엔드 서버 포트
const BACKEND_PORT = 8000;

// 개발 모드 확인
const isDev = !app.isPackaged;

/**
 * 백엔드 서버 시작
 */
function startBackend() {
    let backendPath;

    if (isDev) {
        // 개발 모드: Python 직접 실행
        backendPath = path.join(__dirname, '..', 'backend');
        backendProcess = spawn('python', ['-m', 'uvicorn', 'app.api.main:app', '--host', '127.0.0.1', '--port', String(BACKEND_PORT)], {
            cwd: backendPath
        });
    } else {
        // 프로덕션: exe 실행
        backendPath = path.join(process.resourcesPath, 'backend_server.exe');
        backendProcess = execFile(backendPath);
    }

    backendProcess.stdout?.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr?.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend exited with code ${code}`);
    });
}

/**
 * 메인 윈도우 생성
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: '급여 계산기'
    });

    // 메뉴 숨기기
    mainWindow.setMenuBarVisibility(false);

    // 프론트엔드 로드
    if (isDev) {
        // 개발 모드: Vite 개발 서버
        mainWindow.loadURL('http://localhost:5175');
        mainWindow.webContents.openDevTools();
    } else {
        // 프로덕션: 빌드된 정적 파일
        const frontendPath = path.join(process.resourcesPath, 'frontend', 'index.html');
        console.log('Resource path:', process.resourcesPath);
        console.log('Frontend path:', frontendPath);
        mainWindow.loadFile(frontendPath);
        mainWindow.webContents.openDevTools(); // 디버깅용
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 앱 시작
app.whenReady().then(() => {
    startBackend();

    setTimeout(() => {
        createWindow();
    }, 2000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 모든 창이 닫히면 앱 종료
app.on('window-all-closed', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});
