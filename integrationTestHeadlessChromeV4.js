const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver')

const driver = new webdriver.Builder()
  .forBrowser('chrome')
  // .setChromeOptions(new chrome.Options().headless().windowSize({
  //   width: 640,
  //   height: 480
  // }))
  .build();

[
  {
    matcher: "go to google",
    stepper: () => driver.get('http://www.google.com')
  },
  {
    matcher: "search for webdriver",
    stepper: () => driver.findElement(webdriver.By.name('q')).sendKeys('webdriver\n')
  },
  {
    matcher: "get the title and then",
    stepper: () => driver.getTitle()
  },
  {
    matcher: "assert that it is what I expect and quit",
    stepper: (title) => {
      if (title === 'webdriver - Google Search') {
        console.log('Test passed');
      } else {
        console.log('Test failed');
      }
      driver.quit();
    }
  }

].reduce((prev, cur) => {
  console.log(prev)
  console.log(cur)
  console.log('---')
  return prev.stepper().then(cur.stepper()), {stepper: () => Promise.resolve()}
});
