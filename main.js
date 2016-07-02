const {app, BrowserWindow, protocol} =  require('electron');
let mainWindow = null
  , DEBUG = false;

!(function(){
  var http = require('http')
    , url = require('url')
    , to = ''
    , nickname = ''
    , headimage = ''
    , urlencode = require('urlencode')
    , run = false;

  http.createServer( (req, res) => {
    try {
      to = urlencode.decode(req.url.match(/to=([^&=]*)/)[1]);
      nickname = urlencode.decode(req.url.match(/nickname=([^&=]*)/)[1])
      headimage = urlencode.decode(req.url.match(/headimage=([^&=]*)/)[1])
    } catch(e) {}

    if (!run) {
      run = true;
      mainWindow && mainWindow.webContents.executeJavaScript(`console.log(" ${to} ${nickname} ${headimage}"); toomaoChat._toSession("${to}", "${nickname}", "${headimage}");`);
      setTimeout(function() {
        run = false;
      }, 1000)
    }
    res.end('')
  }).listen(9990)
})();

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: DEBUG ? 800 : 300,
    height: DEBUG ? 600 : 280,
    minimizable: false,
    maximizable: false,
    resizable: false,
    frame: false
  })
  mainWindow.setMenu(null)
  // mainWindow.setIgnoreMouseEvents(true)

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/views/login/index.html`);

  mainWindow.loadMainPanel = function() {
    mainWindow.loadURL(`file://${__dirname}/views/main/index.html`)
    mainWindow.setSize(DEBUG ? 800 : 300, 600, true)

    setTimeout(function() {
      mainWindow && mainWindow.webContents.executeJavaScript(`toomaoChat._toSession("55a9b3560cf2e5da3e7c6332", "Test", "http://pic.toomao.com/0e3ef53dd2a591804de61d60ab099aa4b81177e2");`);
      mainWindow && mainWindow.webContents.executeJavaScript(`toomaoChat._toSession("55a9b3560cf2e5da3e7c6333", "Test2", "http://pic.toomao.com/85ca4c09b5677865a42c12254f620b33be396aa2");`);
    }, 1000);
  }

  // Open the DevTools.
  DEBUG && mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

protocol.registerStandardSchemes(['toomaochat']);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createWindow();
  protocol.registerHttpProtocol('toomaochat', (request, callback) => {
    console.log('register')
    console.log(request.url)
  }, (error) => {
    if (error) {
      console.error('Failed to register protocol');
    }
  })

  protocol.interceptHttpProtocol('toomaochat', () => {
    console.log('toomaochat hi')
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
