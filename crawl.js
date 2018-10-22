const HCCrawler = require('headless-chrome-crawler');
const URL = require("url").URL;

(async () => {
    const crawler = await HCCrawler.launch({
        // Be kind to the remote webserver
        obeyRobotsTxt: false,
        maxConcurrency: 1,
        delay: 5000,

        // Crawl somewhat deeply
        // Number of visits in order to view a scoresheet: 3
        // Landing page -> team -> game scoresheet
        maxDepth: 3,

        preRequest: (options) => {
                const url = new URL(options.url);

                // Only fetch pages that are relevant to finding game scoresheets
                if (url.pathname === "/display-stats.php") {
                    return true;
                }
                if (url.pathname === "/display-schedule") {
                    return true;
                }
                if (url.pathname === "/oss-scoresheet") {
                    return true;
                }
                return false;
        },

        evaluatePage: () => ({
            title: $('title').text(),
        }),
        onSuccess: (result => {
            console.log(result.options.url);
        }),
        onError: (error => {
            //console.log("Error", error);
        }),
    });
    const entry = "https://stats.sharksice.timetoscore.com/display-stats.php?league=1&season=43";
    //crawler.queue('https://example.com/');
    crawler.queue("https://stats.sharksice.timetoscore.com/display-stats.php?league=1&season=43");
    await crawler.onIdle();
    await crawler.close();
})();