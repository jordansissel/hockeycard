const puppeteer = require('puppeteer');

(async () => {
  //const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" });
  const page = await browser.newPage();

  const entry = { 
    href: "https://stats.sharksice.timetoscore.com/display-stats.php?league=1&season=43",
    textContent: "landing page"
  }

  const queue = [entry]

  sleep = async (duration) => new Promise((resolve) => setTimeout(resolve, duration))

  mirror = async (page, queue) => {
    while (queue.length > 0) {
      const anchor = await  queue[0]
      console.log("Current: ", anchor);
      const url = anchor.href;
      console.log("[" + queue.length + "] Fetching " + url)
      console.log("Page title: " + anchor.textContent);
      await page.goto(url);
      const links = await page.$$eval('a', anchors => anchors.map((a) => {
        return { 
          href: a.href,
          textContent: a.textContent,
        }
      }));
      await sleep(5000);

      queue = queue.slice(1).concat(links)
    }
  }

  await mirror(page, queue)
  await browser.close();
})();