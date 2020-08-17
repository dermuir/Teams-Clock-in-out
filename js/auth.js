const {Builder, By, Key, until, } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

function auth() {
(async function clocker() {
  let driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments('--headless')).build();
  var auth;
  try {
    await driver.get('https://teams.microsoft.com/go#');
    await driver.findElement(By.id('i0116')).sendKeys("daniel.saenzlz@uanl.edu.mx");
    await driver.findElement(By.id('idSIButton9')).click();
    await driver.findElement(By.id('i0118')).sendKeys("Lap1532846");
    await sleep(2000)
    await driver.findElement(By.id('idSIButton9')).click();
    await driver.findElement(By.id('idSIButton9')).click();
    await sleep(10000);
    await driver.get('https://teams.microsoft.com/_#/apps/42f6c1da-a241-483a-a3cc-4f5be9185951/sections/shifts');
    await driver.executeScript("return document.body.innerText").then(value => auth = value[0]);
    await sleep(8000);
    if (auth !== "I") {
      return 1;
    } else {
      return 0;
    }
  } finally {
    await driver.quit();
  }
})();
}
export {auth};
