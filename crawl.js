const HCCrawler = require('headless-chrome-crawler');
const BaseCache = require('headless-chrome-crawler/cache/base');
const URL = require("url").URL;

class Cacher extends BaseCache {
    // Cache into Elasticsearch
}

const HockeyCrawler = {
    obeyRobotsTxt: false,

    // Be kind to the remote webserver
    maxConcurrency: 1,
    delay: 5000,

    // Number of clicks required to to view a scoresheet: 3
    // Landing page -> team -> game scoresheet
    maxDepth: 3,

    // Don't need jQuery.
    jQuery: false,

    //cache: new Cacher(),

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
        // Whole page as HTML text so that we can store it in Elasticsearch
        html: new XMLSerializer().serializeToString(document),
    }),
    onSuccess: (result => {
        console.log(result.result.html);
        console.log("[" + result.result.html.length + " bytes] " + result.options.url)
    }),
    onError: (error => {
        //console.log("Error", error);
    }),
};

(async () => {
    const crawler = await HCCrawler.launch(HockeyCrawler);
    const entry = "https://stats.sharksice.timetoscore.com/display-stats.php?league=1&season=43";
    //crawler.queue('https://example.com/');
    crawler.queue("https://stats.sharksice.timetoscore.com/display-stats.php?league=1&season=43");
    await crawler.onIdle();
    await crawler.close();
})();