const { app, BrowserWindow , Menu, Tray, ipcMain, Notification  } = require('electron');
const cron = require('node-cron');
const AutoLaunch = require('auto-launch');
const Store = require('./js/store.js');
var clockin,clockout;
const teamsautolauncher = new AutoLaunch({
    name: 'Teams Clock in/out',
    path: app.getPath("exe")
});
const store = new Store({
    configName: 'teamv1',
    defaults: {
        teams: 0,email: '*', password: '*', timein: "12:00", timeout: "16:00",
    clockin: 0, clockout: 0,lastclocks: 0, weekhours:0, monthhours:0, errors:0, days:"*"
    }
});
app.setMaxListeners(20);

app.on('ready', () => {
  var win = new BrowserWindow({
    title: "Microsoft Teams Clock in / out",
    icon: `${__dirname}/images/teams.png`,
    frame: false,
    webPreferences: {
            nodeIntegration: true
        },
      show: false
  });
  win.on('ready-to-show', ()=>{
      setTimeout(() => {
        win.maximize();
        }, 800);
  })
  var appIcon = new Tray(`${__dirname}/images/icons/teams.ico`);
  const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Exit', click: function () {
                app.isQuiting = true
                app.quit()
            }
        }
  ]);
  if(store.get('email') !== '*' && store.get('password') !== '*'){
      win.loadURL(`file://${__dirname}/screens/dashboard_screen.html`);
      if (Notification.isSupported() === true){
          const myNotification = new Notification({title:'Teams',body:'Schedule clock i/o started',icon:`${__dirname}/images/icons/teams.ico`});
        myNotification.show();
      }
      if(store.get('teams') !== 0){
          try {
          schedule(this.store.get('timein').slice(0, 2), this.store.get('timein').slice(3, 5), this.store.get('timeout').slice(0, 2), this.store.get('timeout').slice(3, 5),this.store.get('days'));
          } catch (e) {
              store.set('errors',store.get('errors')+1);
          }
      }
  }else{
      win.loadURL(`file://${__dirname}/screens/start_screen.html`);
  }
  appIcon.setContextMenu(contextMenu);
  appIcon.on('click', function(e){
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      if (win.isMaximized() === false) {
            win.maximize();
      }
    }
  });
    ipcMain.on('minimize', (event, arg) => {
        console.log(arg);
        win.minimize();
    })
    ipcMain.on('maximize', (event, arg) => {
        if (win.isMaximized() === false) {
            win.maximize();
        } else {
            win.setSize(1000,1000);
        }
    })
    ipcMain.on('restore', (event, arg) => {
        win.setSize(1000,1000);
        console.log(arg);
    })
    ipcMain.on('closer', (event, arg) => {
        console.log(arg);
        win.hide();
        appIcon.setImage(`${__dirname}/images/icons/teams.ico`);
    })
    ipcMain.on('request-data', (event, arg) => {
        if(arg === true){
            event.reply('response-data',{team: store.get('teams'), timein: store.get('timein'), timeout: store.get('timeout'),clockin: store.get('clockin'), clockout: store.get('clockout'),lastclocks: store.get('lastclocks'),
                weekhours:store.get('weekhours'), monthhours:store.get('monthhours'), errors:store.get('errors')});
        }
    })
    ipcMain.on('auth', (event, arg) => {
        console.log(arg);
        auther(arg.email,arg.pass).then(value => {
            console.log(value);
            if (value === 1) {
                console.log("Authentication");
                store.set('email',arg.email);
                store.set('password',arg.pass);
                win.loadURL(`file://${__dirname}/screens/dashboard_screen.html`);
            } else {
                event.reply('loading', 'false')
                console.log("Not Authentication");
            }
        });
    })
    ipcMain.on('logout', (event, arg) => {
        if (arg === 'true') {
            win.loadURL(`file://${__dirname}/screens/start_screen.html`);
            store.set('teams',0);
            store.set('email','*');
            store.set('password','*');
            store.set('timein','12:00');
            store.set('timeout','16:00');
            store.set('clockin',0);
            store.set('clockout',0);
            store.set('lastclocks',0);
            store.set('weekhours',0);
            store.set('monthhours',0);
            store.set('errors',0);
        }
    })
    teamsautolauncher.enable();
    teamsautolauncher.isEnabled()
    .then(function(isEnabled){
        if(isEnabled){
            return;
        }
        teamsautolauncher.enable();
    })
    .catch(function(err){
        // handle error
    });
    // var task = cron.schedule()
    // TODO: clockin ipc render
    ipcMain.on('schedule', (event, arg) => {
        store.set('teams',arg.team);
        store.set('timein',arg.timein);
        store.set('timeout',arg.timeout);
        store.set('days',arg.days);

        if (validate() === true){
            console.log("activating");
            try{
                stopSchedule();
                schedule(arg.timein.slice(0,2),arg.timein.slice(3,5),arg.timeout.slice(0,2),arg.timeout.slice(3,5),arg.days);
                // clockins(store.get('email'),store.get('password'),Number(store.get('teams')));
            }catch (e) {
                store.set('errors',store.get('errors')+1);
            }
            event.reply('status-response',true);
        }else {
            store.set('errors',store.get('errors')+1);
            event.reply('status-response',false);
        }
    })

    /*
    clockin = cron.schedule("0 0 "+ "12" +" * 0-5", () => { core.clock(); }, { scheduled: true });
    clockin.start();
  console.log('Teams clock i/o app is ready.');*/
});

function validate() {
    team = store.get('teams');
    timein = store.get('timein');
    timeout = store.get('timeout');
    if (Number(timein.slice(0,2)) < Number(timeout.slice(0,2)) && team > 0) {
        return true;
    } else {
        if (Number(timein.slice(0,2)) === Number(timeout.slice(0,2)) && Number(timein.slice(3,5)) < Number(timeout.slice(3,5)) && team > 0) {
            return true;
        }else{
            return false;
        }
    }
}
function stopSchedule() {
    try{
        this.clockin.destroy();
        this.clockout.destroy();
    } catch (e) {
        store.set('errors',store.get('errors')+1);
    }

}
function schedule(clockinhour,clockinminute,clockouthour,clockoutminute,days) {
    this.clockin = cron.schedule("0 " + clockinminute +" "+ clockinhour +" * * " + days, () => { clockins(store.get('email'),store.get('password'),Number(store.get('teams'))); }, { scheduled: true });
    this.clockout = cron.schedule("0 " + clockoutminute +" "+ clockouthour +" * * " + days, () => { clockouts(store.get('email'),store.get('password'),Number(store.get('teams'))); }, { scheduled: true });
    this.clockin.start();
    this.clockout.start();
}

const {Builder, By, Key, until, } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

function clockins(email,password,teams) {
(async function clocker() {
  let driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments('--headless')).build();
  var auth;
  try {
    await driver.get('https://teams.microsoft.com/go#');
    await driver.findElement(By.id('i0116')).sendKeys(email);
    await driver.findElement(By.id('idSIButton9')).click();
    await driver.findElement(By.id('i0118')).sendKeys(password);
    await sleep(2000)
    await driver.findElement(By.id('idSIButton9')).click();
    await driver.findElement(By.id('idSIButton9')).click();
    await sleep(10000);
    await driver.get('https://teams.microsoft.com/_#/apps/42f6c1da-a241-483a-a3cc-4f5be9185951/sections/shifts');
    await driver.executeScript("return document.body.innerText").then(value => auth = value[0]);
    await sleep(8000);
    if (auth !== "I") {
      await driver.switchTo().activeElement().sendKeys(Key.TAB);
      for (let i = 1; i < teams; i++) {
        await driver.switchTo().activeElement().sendKeys(Key.ARROW_DOWN);
      }
      await driver.switchTo().activeElement().sendKeys(Key.ENTER);
      await sleep(8000);
      await driver.switchTo().activeElement().sendKeys(Key.TAB);
      await driver.switchTo().activeElement().sendKeys(Key.RIGHT);
      await driver.switchTo().activeElement().sendKeys(Key.RIGHT);
      await driver.switchTo().activeElement().sendKeys(Key.RIGHT);
      await driver.switchTo().activeElement().sendKeys(Key.ENTER);
      await sleep(5000);
      await driver.switchTo().activeElement().sendKeys(Key.TAB);
      await driver.switchTo().activeElement().sendKeys(Key.ENTER);
      await sleep(5000);
      await driver.switchTo().activeElement().sendKeys(Key.TAB);
      await driver.switchTo().activeElement().sendKeys(Key.ENTER);
      await console.log("Register clock in");
      store.set('clockin',store.get('clockin')+1);
      if (Notification.isSupported() === true) {
          const myNotification = new Notification({
              title: 'Teams',
              body: 'Clock in registered',
              icon: `${__dirname}/images/icons/teams.ico`
          });
          myNotification.show();
      }
      return 1;
    } else {
      return 0;
    }
  }catch (e) {
      console.log(e);
      store.set('errors',store.get('errors')+1);
  } finally {
    await driver.quit();
  }
})();
}
function clockouts(email,password,teams) {
(async function clocker() {
  let driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments('--headless')).build();
  var auth;
  try {
    await driver.get('https://teams.microsoft.com/go#');
    await driver.findElement(By.id('i0116')).sendKeys(email);
    await driver.findElement(By.id('idSIButton9')).click();
    await driver.findElement(By.id('i0118')).sendKeys(password);
    await sleep(2000)
    await driver.findElement(By.id('idSIButton9')).click();
    await driver.findElement(By.id('idSIButton9')).click();
    await sleep(10000);
    await driver.get('https://teams.microsoft.com/_#/apps/42f6c1da-a241-483a-a3cc-4f5be9185951/sections/shifts');
    await driver.executeScript("return document.body.innerText").then(value => auth = value[0]);
    await sleep(8000);
    if (auth !== "I") {
      await driver.switchTo().activeElement().sendKeys(Key.TAB);
      for (let i = 1; i < teams; i++) {
        await driver.switchTo().activeElement().sendKeys(Key.ARROW_DOWN);
      }
      await driver.switchTo().activeElement().sendKeys(Key.ENTER);
      await sleep(8000);
      await driver.switchTo().activeElement().sendKeys(Key.TAB);
      await driver.switchTo().activeElement().sendKeys(Key.RIGHT);
      await driver.switchTo().activeElement().sendKeys(Key.RIGHT);
      await driver.switchTo().activeElement().sendKeys(Key.RIGHT);
      await driver.switchTo().activeElement().sendKeys(Key.ENTER);
      await sleep(5000);
      await driver.switchTo().activeElement().sendKeys(Key.TAB);
      await driver.switchTo().activeElement().sendKeys(Key.ENTER);
      await sleep(5000);
      await driver.switchTo().activeElement().sendKeys(Key.TAB);
      await driver.switchTo().activeElement().sendKeys(Key.ENTER);
      await console.log("Register clock out");
      store.set('clockout',store.get('clockout')+1);
      if (Notification.isSupported() === true){
          const myNotification = new Notification({
              title:'Teams',
              body:'Clock out registered',
              icon:`${__dirname}/images/icons/teams.ico`
          });
          myNotification.show();
      }
      return 1;
    } else {
      return 0;
    }
  }catch (e) {
      console.log(e);
      store.set('errors',store.get('errors')+1);
  } finally {
    await driver.quit();
  }
})();
}

async function auther(email, password) {
    let driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments('--headless')).build();
    var auth = 0;
    try {
        await driver.get('https://teams.microsoft.com/go#');
        await driver.findElement(By.id('i0116')).sendKeys(email);
        await driver.findElement(By.id('idSIButton9')).click();
        await driver.findElement(By.id('i0118')).sendKeys(password);
        await sleep(2000)
        await driver.findElement(By.id('idSIButton9')).click();
        await driver.findElement(By.id('idSIButton9')).click();
        await sleep(10000);
        await driver.get('https://teams.microsoft.com/_#/apps/42f6c1da-a241-483a-a3cc-4f5be9185951/sections/shifts');
        await sleep(8000);
        await driver.executeScript("return document.body.innerText").then(value => auth = value);
        console.log(auth[0]);
        if (auth[0] !== "I") {
            auth = 1;
            if (Notification.isSupported() === true){
              const myNotification = new Notification({
                  title:'Teams',
                  body:'Authentication completed',
                  icon:`${__dirname}/images/icons/teams.ico`
              });
              myNotification.show();
            }
        }
    } catch (e) {
        console.log(e);
        auth = 0;
    } finally {
        await driver.quit();
    }
    return auth;
}


