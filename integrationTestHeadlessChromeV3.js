const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver')

const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .setChromeOptions(new chrome.Options().headless().windowSize({
    width: 640,
    height: 480
  }))
  .build();
  
[
  () => driver.get('http://www.google.com'),
  () => driver.findElement(webdriver.By.name('q')).sendKeys('webdriver\n'),
  () => driver.getTitle(),
  (title) => {
    if (title === 'webdriver - Google Search') {
      console.log('Test passed');
    } else {
      console.log('Test failed');
    }
    driver.quit();
  }
].reduce((prev, cur) => prev.then(cur), Promise.resolve());