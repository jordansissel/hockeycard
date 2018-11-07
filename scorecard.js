'use strict';

const puppeteer = require('puppeteer');
const path = require("path");

// nodejs stable (8) idoesn't have path-to-file-url yet.
const pathToURL = (local) => "file:///" + path.resolve(local).replace(/\\/g, "/")

async function parse() {
    const getHTML = (selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            return { error: "Selector did not match anything: " + selector };
        }
        const result = {
            html: [],
            text: [],
        }

        //console.log("Element count: " + elements.length + " // " + selector);
        elements.forEach(i => {
            result.html.push(i.innerHTML);
            result.text.push(i.innerText);
        });
        return result;
    };

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

    const text = el => { 
        if (el.innerText) {
            return el.innerText.trim();
        } else {
            return undefined;
        }
    }
    const numeric = el => parseInt(text(el));

    const base_event = {
        league: document.querySelector(selectors.league).innerText.replace(/^League: */, ""),
        level: document.querySelector(selectors.level).innerText.replace(/^Level: */, ""),
        location: document.querySelector(selectors.location).innerText.replace(/^Location: */, ""),
        scorekeeper: document.querySelector(selectors.scorekeeper).innerText,
        referee: Array.from(document.querySelectorAll([selectors.referee1, selectors.referee2].join(","))).map(i => i.innerText),
        // game id
        // game_type
        // season
    }
    
    const team = { 
        home: text(document.querySelector(selectors.home)),
        visitor: text(document.querySelector(selectors.visitor)),
    };
    const parseScoring = element => {
        var period, otime, note, scorer, assist1, assist2;
        [period, time, note, scorer, assist1, assist2] = element.querySelectorAll("td")
        return {
            period: text(period),
            time: text(time),
            note: text(note),
            scorer: numeric(scorer),
            assists: [numeric(assist1), numeric(assist2)].filter(n => !isNaN(n)),
        };
    };
    const events = [];
    events.push.apply(events, Array.from(document.querySelectorAll(selectors.homeScoring)).map(parseScoring).map(i => { i.team = team.home; return i; }));
    events.push.apply(events, Array.from(document.querySelectorAll(selectors.visitorScoring)).map(parseScoring).map(i => { i.team = team.visitor; return i; }));
    events.forEach(i => console.log(JSON.stringify(i)));

}; // parse

(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    page.on("console", message => console.log("[browser log] " + message.text()));

    const fixture = pathToURL("./180176.html");
    await page.goto(fixture);
    await page.evaluate(parse);

    //await new Promise((resolve, reject) => {
        //const repl = require("repl");
        //const r = repl.start();
        //r.context.page = page;
        //r.on("exit", resolve);
        //r.on("error", reject);
    //})
    await browser.close();
})();