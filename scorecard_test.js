'use strict';

const puppeteer = require('puppeteer');
const path = require("path");
const parse = require("./scorecard").parse;

// nodejs stable (8) idoesn't have path-to-file-url yet.
const pathToURL = (local) => "file:///" + path.resolve(local).replace(/\\/g, "/");

(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    page.on("console", message => console.log("[browser log] " + message.text()));

    // const fixture = pathToURL("./180176.html");
    const fixture = pathToURL("./180709.html");
    await page.goto(fixture);
    const game = await page.evaluate(parse);
    //console.log(JSON.stringify(game.team, null, 2));
    game.events.forEach(i => {
        console.log(JSON.stringify(i));
        // console.log(JSON.stringify({
        //      "t": i["@timestamp"],
        //      "e": i.type,
        //      "a": i.team,
        //      "p": i.player.name,
        //      "i": i.infraction,
        //  }));
    });

    let h = 0; for (var i in game.team.home.players) { h++ }
    let v = 0; for (var i in game.team.visitor.players) { v++ }
    console.log(game.team.home.name + " players: " + h);
    console.log(game.team.visitor.name + " players: " + v);

    // console.log(JSON.stringify(events.filter(i => i.type === "scoring").reduce((s, v) => { s[v.team] = (s[v.team] || 0) + 1; return s; }, {})));
    // const homeGoals = events.filter(i => i.team === team.home.name).filter(i => i.type === "scoring");
    // console.log("Home goals: " + homeGoals.length);

    await browser.close();
})();