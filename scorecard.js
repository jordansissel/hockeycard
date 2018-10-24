'use strict';

const puppeteer = require('puppeteer');
const path = require("path");

// nodejs stable (8) idoesn't have path-to-file-url yet.
const pathToURL = (local) => "file:///" + path.resolve(local).replace(/\\/g, "/")

async function parse(page) {
    const getHTML = async (selector) => {
        return await page.evaluate(selector => {
            /* This code executs in Chrome, not in Node, so we cannot use any shared code here. */
            const elements = document.querySelectorAll(selector);
            if (elements.length === 0) {
                 return { error: "Selector did not match anything: " + selector };
            }
            const result = {
                html: [],
                text: [],
            }

            //console.log("Element count: " + elements.length + " // " + selector);
            elements.forEach(i =>  {
                result.html.push(i.innerHTML);
                result.text.push(i.innerText);
            });
            return result;
        }, selector);
    };

    const result = {};
    const selectors = {
        date: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1)",
        time: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)",
        league: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1)",
        level: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1)",
        location: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(4) > td:nth-child(1)",
        scorekeeper: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)",
        referee1: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)",
        referee2: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)",
        visitor: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)",
        visitorPlayers: "body > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(n+2)",
        visitorScoring: "body > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(n+4)",
        visitorPenalties: "body > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(n+3)",
        home: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)",
        homePlayers: "body > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(n+2)",
        homeScoring: "body > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(n+4)",
        homePenalties: "body > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(4) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(n+3)",

        // Selectors we'll use to verify that parsing other parts were correct.
        visitorGoals: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(7)",
        homeGoals: "body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(7)",

    };
    for (var name in selectors) {
        result[name]  = await getHTML(selectors[name]);
    }
    console.log(result);
}; // parse

(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    page.on("console", message => console.log("[browser log] " + message.text()));

    const fixture = pathToURL("./180176.html");

    await page.goto(fixture);

    await parse(page)


    //await new Promise((resolve, reject) => {
        //const repl = require("repl");
        //const r = repl.start();
        //r.context.page = page;
        //r.on("exit", resolve);
        //r.on("error", reject);
    //})
    await browser.close();
})();