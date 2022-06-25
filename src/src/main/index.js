import {
  Tray,
  app,
  BrowserWindow,
  Menu,
  electron,
  ipcMain
} from 'electron'
import pkg from '../../package.json'
import windowStateKeeper from 'electron-window-state';

import {
  v4 as uuidv4
} from 'uuid';
import sysinfo from 'systeminformation';
import fs from 'fs';
import request from 'request';
import log from 'electron-log';
log.transports.file.level = 'info';
log.transports.file.resolvePath = () => process.cwd() + '/.config/hamonikrAuth/logs/mainlog.log';

require('@electron/remote/main').initialize()

// set app name
app.name = pkg.productName

// to hide deprecation message
app.allowRendererProcessReuse = true

// disable electron warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = false

const gotTheLock = app.requestSingleInstanceLock()
const isDev = process.env.NODE_ENV === 'development'
const isDebug = process.argv.includes('--debug')
let mainWindow
var folderDir = '/.config/hamonikrAuth/configSysInfo/'
var fileDir = '/.config/hamonikrAuth/configSysInfo/sysInfo.hmkr'
var licenseFileDir = '/.config/hamonikrAuth/configSysInfo/license.hmkr'

let trayIcon = null;



// only allow single instance of application
if (!isDev) {
  if (gotTheLock) {
    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow && mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    })
  } else {
    app.quit()
    process.exit(0)
  }
} else {
  // process.env.ELECTRON_ENABLE_LOGGING = true

  require('electron-debug')({
    showDevTools: false,
  })
}

let position_x = '';
let position_y = '';
async function createWindow() {

  const {
    screen
  } = require('electron')
  let display = screen.getPrimaryDisplay();
  let bounds = screen.getPrimaryDisplay().bounds;
  position_x = bounds.x + ((bounds.width - 960) / 2);
  position_y = bounds.y + ((bounds.height - 540) / 2);


  mainWindow = new BrowserWindow({
    backgroundColor: '#fff',
    x: position_x,
    y: position_y,
    width: 800,
    height: 400,
    // width: 960,
    // height: 540,
    minWidth: 800,
    minHeight: 400,
    // useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      contextIsolation: false,
      webSecurity: false,
    },
    show: false,
    // icon: `${__dirname}/assets/icon.ico`,
  })

  // setMenu()

  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAlwaysOnTop(true, 'screen');
  // mainWindow.setFullScreen(false); 

  
  // load root file/url
  if (isDev) {
    mainWindow.loadURL('http://localhost:9080')
  } else {
    mainWindow.loadFile(`${__dirname}/index.html`)
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  }

  // Show when loaded
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  })

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
    // mainWindow = null;
  });

}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


app.on('ready', () => {


  createWindow();
  createTray();
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates();
  // autoUpdater.checkForUpdates();

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  if (isDebug) {
    mainWindow.webContents.openDevTools()
  }

})

const toggleWindow = () => {
  mainWindow.isVisible() ? mainWindow.hide() : showWindow();
}
const showWindow = () => {
  // const position = getWindowPosition();
  
  const {
    screen
  } = require('electron')
  let display = screen.getPrimaryDisplay();
  let bounds = screen.getPrimaryDisplay().bounds;
  position_x = bounds.x + ((bounds.width - 960) / 2);
  position_y = bounds.y + ((bounds.height - 540) / 2);

  mainWindow.setPosition(position_x, position_y, false);
  mainWindow.show();
}
const getWindowPosition = () => {
  return {
    x: position_x,
    y: position_y
  }
}


const createTray = () => {
  const iconName = '/logo.png';
  log.info("__dirname===========>" + __dirname);
  log.info("__static===========>" + __static);
  log.info("process.cwd() ===="+ process.cwd() );

  const iconPath = require('path').join(__static, iconName);
  trayIcon = new Tray(iconPath);

  const trayMenuTemplate = [{
    label: 'Hamonikr-Auth',
    //enabled: false
    click: function () {
      // toggleWindow();
      showWindow();
    }
  }, {
    label: 'devTool',
    click: function () {
      app.quit();
      app.exit();  
      var exec = require('child_process').exec;
      exec("/usr/share/hamonikr-auth/linux/restartApp.sh", (error, stdout, stderr) => {
        if (error) {
          log.info(`exec error: ${error}`);
          return;
        }
      });
      // mainWindow.webContents.openDevTools()
    }
  }, {
    label: 'Quit',
    click: () => {
      // mainWindow.close();
      app.quit();
      app.exit();
    }
  }]

  let trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
  // trayIcon.setTitle('hamonikrAuth');
  trayIcon.setContextMenu(trayMenu)
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


const sendMenuEvent = async (data) => {
  mainWindow.webContents.send('change-view', data)
}

const template = [{
    label: app.name,
    submenu: [{
        label: 'Home',
        accelerator: 'CommandOrControl+H',
        click() {
          sendMenuEvent({
            route: '/'
          })
        },
      },
      {
        type: 'separator'
      },
      {
        type: 'separator'
      },
      // { role: 'quit', accelerator: 'Alt+F4' },
    ],
  },
  {
    role: 'help',
    submenu: [{
        label: 'Get Help',
        role: 'help',
        accelerator: 'F1',
        click() {
          sendMenuEvent({
            route: '/help'
          })
        },
      },
      {
        label: 'About',
        role: 'about',
        accelerator: 'CommandOrControl+A',
        click() {
          sendMenuEvent({
            route: '/about'
          })
        },
      },
    ],
  },
]

function setMenu() {
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [{
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services'
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        },
      ],
    })

    template.push({
      role: 'window',
    })

    template.push({
      role: 'help',
    })

    template.push({
      role: 'services'
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}


let pushRenderer = null;

ipcMain.on("readLiecenseFile", async (event, args) => {
  log.info(`Application Init License Data & File Check] START- readLiecenseFile Action()`);

  // License File & Data Check , Result N/data
  let isFileData = await do_readLiecenseFile(args);
  log.info(`Application Init License Data & File Check] Result :: ${isFileData}`);

  pushRenderer = event.sender;
  pushRenderer.send("readLiecenseFileResult", isFileData);

});


//========================================================================

function getOsMachineId(_fileDir) {
  return new Promise(function (resolve, reject) {
    fs.readFile(_fileDir, 'utf-8', (err, data) => {
      if (err) {
        return resolve("N");
      } else {
        return resolve(data);
      }
    });
  });
}

function userLcnsInfoWriteFile(licenseNo) {
  return new Promise(function (resolve, reject) {
    if (!fs.existsSync(licenseFileDir)) {
      fs.writeFile(process.cwd() + licenseFileDir, licenseNo, (err) => {
        if (err) {
          reject("error");
          log.info("#### userLcnsInfoWriteFile   #### " + err.message);
        }
        resolve("Y");
      });

    } else {
      fs.writeFile(process.cwd() + licenseFileDir, licenseNo, (err) => {
        if (err) {
          reject("error");
          log.info("#### userLcnsInfoWriteFile   #### " + err.message);
        }
        resolve("Y");
      });
    }
  });
}

const createDir = (dirPath) => {
  fs.mkdirSync(process.cwd() + dirPath, {
    recursive: true
  }, (error) => {
    if (error) {
      log.info("#### CreateDir Action Result is   #### " + error);
    } else {
      log.info("CreateDir Action Result Is Success")
    }
  });
}

const createFile = (filePath, fileContent) => {
  fs.writeFile(process.cwd() + filePath, fileContent, (error) => {
    if (error) {
      log.info("#### CreateFile Action Result  ####" + error);
    } else {
      log.info("CreateFile Action Result is Success")
    }
  })
}

function userOsMachineIdWriteFile(uuidData) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(fileDir)) {
      try {
        createDir(folderDir);
        createFile(fileDir, uuidData);
        resolve('Y');
      } catch {
        resolve('N');
      }
    }
  });
}


function do_readLiecenseFile(arg) {
  return new Promise(function (resolve, reject) {

    var osType = require('os');
    fs.readFile(process.cwd() + licenseFileDir, 'utf-8', (err, data) => {
      if (err) {
        log.info("#### do_readLiecenseFile  #### " + err);
        return resolve("N");
      } else {
        log.info("do_readLiecenseFile Result Data Is ::: " + data);
        resolve(uuid_db_chk(data, arg));
      }
    });
  });
}

// 라이선스 체크 (리턴값: 사용기간 유무)
function uuid_db_chk(arg) {
  return new Promise((resolve, reject) => {
    const formData = {
      usedUserLicenseUUID: arg.trim()
    };
    request.post({
      url: "http://192.168.0.118:8090/restapi/licenseChk",
      formData: formData
    }, async (err, response, body) => {
      if (err) return reject(err);
      const result = JSON.parse(body);
      log.info(`uuid_db_chk Action Result Data is ::: ${result.output}`)
      resolve(result.output);
    });
  });
}


// // (Polling) 라이선스 체크  
// const Poller = require('./Poller');
// let poller = new Poller(10000);

// poller.onPoll(async () => {
//   let isdata = await do_readLiecenseFile();
//   log.info(`License Check Polling ]  License Auth Is :: ${isdata}`);
//   if (isdata == 'N') {
//     if (isDev) {
//       mainWindow.loadURL('http://localhost:9080/#/about')
//     } else {
//       mainWindow.loadFile(`${__dirname}/about`)
//     }
//     mainWindow.setMenu(null);
//     mainWindow.setMenuBarVisibility(false);
//     mainWindow.setAlwaysOnTop(true, 'screen');
//     // mainWindow.setKiosk(true);
//     mainWindow.show();
//     mainWindow.webContents.openDevTools()
//   }

//   poller.poll(); // Go for the next poll

// });

// // Initial start
// poller.poll();



ipcMain.on("ChkLicenseProc", async (event, args) => {
  let isdata = await do_readLiecenseFile();
  log.info(`ChkLicenseProc Result ::: ${isdata}`);
  if (isdata == 'N') {
    mainWindow.show()
    pushRenderer = event.sender;
    pushRenderer.send("ChkLicenseProcResult", isdata);
  }

});


// electron auto update ====
import {
  autoUpdater
} from 'electron-updater'

ipcMain.on("app_version", async (event, args) => {
  pushRenderer = event.sender;
  console.log("app.getVersion()=========++" + app.getVersion());
  pushRenderer.send("view_app_version", {
    version: app.getVersion()
  });
});


// ipcMain.on("checking-for-update", async (event, args) => {
//   pushRenderer = event.sender;
//   console.log("checking-for-update()=========UPDATE CHECK----------");
//   // pushRenderer.send("view_app_version", {version: app.getVersion()});
// });


autoUpdater.on('update-available', () => {
  log.info('업데이트 가능');
  console.log("update-available()=========UPDATE CHECK----------");
  // pushRenderer.send("view_update-available");
  try {
    pushRenderer.send("view_update-available");
  } catch (err) {
    if (this.isNetworkError(err)) {
      log.info('update checking] Network Error');
    } else {
      log.info('update checking] Unknown Error');
      // log.info(err == null ? 'unknown' : (err.stack || err).toString());
    }
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('업데이트가 완료되었습니다.');
  pushRenderer.send("view_update-downloaded", info);
});

ipcMain.on("restart_app", async (event, args) => {
  pushRenderer = event.sender;
  console.log("restart_app()=========++" + app.getVersion());
  try {

    setTimeout(() => {
      app.quit();
      app.exit();  
      var exec = require('child_process').exec;
      exec("/usr/share/hamonikr-auth/linux/restartApp.sh", (error, stdout, stderr) => {
        if (error) {
          log.info(`exec error: ${error}`);
          return;
        }
      });
    }, 6000);
  } catch (e) {
    console.log('Error', 'Failed to install updates');
  }
});




// autoUpdater.on('update-available', (info) => {
//   log.info('업데이트가 가능합니다.');
// });
autoUpdater.on('update-not-available', (info) => {
  log.info('현재 최신버전입니다.');
  // pushRenderer.send("view_update-not-available", info);
  try {
    pushRenderer.send("view_update-not-available", info);
  } catch (err) {
    if (this.isNetworkError(err)) {
      log.info('update checking-(update-not-available)] Network Error');
    } else {
      log.info('update checking - (update-not-available)] Unknown Error');
      log.info(err == null ? 'unknown' : (err.stack || err).toString());
    }
  }
});
// autoUpdater.on('error', (err) => {
//   log.info('에러가 발생하였습니다. 에러내용 : ' + err);
// });

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "다운로드 속도: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - 현재 ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);

  pushRenderer.send("view_download-progress", log_message);

})