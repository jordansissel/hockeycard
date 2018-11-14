'use strict';

const puppeteer = require('puppeteer');
const path = require("path");

// nodejs stable (8) idoesn't have path-to-file-url yet.
const pathToURL = (local) => "file:///" + path.resolve(local).replace(/\\/g, "/")

async function parse() {
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
        if (el !== undefined && el.innerText) {
            return el.innerText.trim();
        } else {
            return undefined;
        }
    }
    const numeric = el => parseInt(text(el));

    const date = document.querySelector(selectors.date).innerText.replace(/^Date: */, "");
    const time = document.querySelector(selectors.time).innerText.replace(/^Time: */, "");
    const gameTime = new Date(date + " " + time);

    const base_event = {
        league: document.querySelector(selectors.league).innerText.replace(/^League: */, ""),
        level: document.querySelector(selectors.level).innerText.replace(/^Level: */, ""),
        location: document.querySelector(selectors.location).innerText.replace(/^Location: */, ""),
        scorekeeper: document.querySelector(selectors.scorekeeper).innerText,
        referee: Array.from(document.querySelectorAll([selectors.referee1, selectors.referee2].join(","))).map(i => i.innerText),
        // game id
        // game_type
        // season
    };

    const team = {
        home: {
            name: text(document.querySelector(selectors.home)),
            players: {},
        },
        visitor: {
            name: text(document.querySelector(selectors.visitor)),
            players: {},
        },
    };

    const parsePlayers = (selector, store) => {
        document.querySelectorAll(selector).forEach(a => {
            const cells = Array.from(a.querySelectorAll("td"));
            if (text(cells[2]) !== "") {
                store[numeric(cells[0])] = { name: text(cells[2]), number: numeric(cells[0]), position: text(cells[1]) };
            }
            if (text(cells[5]) !== "") {
                store[numeric(cells[3])] = { name: text(cells[5]), number: numeric(cells[3]), position: text(cells[4]) };
            }
        });
    };
    parsePlayers(selectors.visitorPlayers, team.visitor.players);
    parsePlayers(selectors.homePlayers, team.home.players);

    console.log(gameTime.toJSON() + ":  start...");
    const parseScoring = (players, element) => {
        var period, time, note, scorer, assist1, assist2;
        [period, time, note, scorer, assist1, assist2] = element.querySelectorAll("td")

        // Times are noted as "time left in the period", so a time of "2:02" means 
        // the event occurred at 17m58s into the period.
        const endOfPeriod = gameTime.valueOf() + (numeric(period) * 20 * 60 * 1000);

        var timestamp;
        if (/:/.test(text(time))) { 
            var m, s; // mm:ss time format
            [m, s] = text(time).split(":").map(x => parseInt(x));
            // Millisecond time of the game when the event occurred. 
            timestamp = new Date(endOfPeriod - ((m * 60) + s) * 1000);
        } else {
            // assume ss.SS time format
            const s = numeric(time);
            timestamp = new Date(endOfPeriod - (s * 1000));
        }

        //console.log(text(period) + "@" + text(time));
        //console.log(timestamp.toJSON() + ": " + players[numeric(scorer)].name + " scored");;
        return {
            period: numeric(period),
            time: text(time),
            note: text(note) !== "" ? text(note) : undefined,
            scorer: players[numeric(scorer)],
            assists: [numeric(assist1), numeric(assist2)].filter(n => !isNaN(n)).map(n => players[n]),
            '@timestamp':  timestamp,
        };
    };
    const events = [];
    events.push.apply(events, Array.from(document.querySelectorAll(selectors.homeScoring)).map(s => parseScoring(team.home.players, s)).map(i => { i.team = team.home.name; return i; }));
    events.push.apply(events, Array.from(document.querySelectorAll(selectors.visitorScoring)).map(s => parseScoring(team.visitor.players, s)).map(i => { i.team = team.visitor.name; return i; }));
    events.forEach(i => console.log(JSON.stringify(i)));
}; // parse

(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    page.on("console", message => console.log("[browser log] " + message.text()));

    const fixture = pathToURL("./180176.html");
    await page.goto(fixture);
    await page.evaluate(parse);

    await browser.close();
})();