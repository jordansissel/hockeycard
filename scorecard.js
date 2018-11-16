'use strict';

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
            if (text(cells[2]) !== "" && text(cells[2]) !== undefined) {
                // console.log(JSON.stringify(text(cells[2])) + " / " + typeof (text(cells[2])));
                const n = isNaN(numeric(cells[0])) ? 0 : numeric(cells[0]);
                store[n] = { name: text(cells[2]), number: n, position: text(cells[1]) };
            }
            if (text(cells[5]) !== "" && text(cells[5]) !== undefined) {
                // console.log(JSON.stringify(text(cells[5])) + " / " + typeof (text(cells[5])));
                const n = isNaN(numeric(cells[3])) ? 0 : numeric(cells[3]);
                store[n] = { name: text(cells[5]), number: n, position: text(cells[4]) };
            }
        });
    };
    parsePlayers(selectors.visitorPlayers, team.visitor.players);
    parsePlayers(selectors.homePlayers, team.home.players);

    console.log(gameTime.toJSON() + ":  start...");
    const computePeriodTime = (timeText) => {
        // Times are noted as "time left in the period", so a time of "2:02" means 
        // the event occurred at 17m58s into the period.
        if (/:/.test(timeText)) { 
            var m, s; // mm:ss time format
            [m, s] = timeText.split(":").map(x => parseInt(x));
            // Millisecond time of the game when the event occurred. 
            //console.log(timeText + ": " + ((m * 60) + s) * 1000);
            return ((m * 60) + s) * 1000;
        } else {
            // assume ss.SS time format
            const s = parseFloat(timeText);
            //console.log(timeText + ": " + (s * 1000));
            return  (s * 1000);
        }
    };
    const computeTimestamp = (period, timeText) => {
        const endOfPeriod = period * 20 * 60 * 1000;
        return new Date(gameTime.valueOf() + (endOfPeriod - computePeriodTime(timeText)));
    };
    const parseScoring = (players, element) => {
        var period, time, note, scorer, assist1, assist2;
        [period, time, note, scorer, assist1, assist2] = element.querySelectorAll("td")
        const timestamp = computeTimestamp(numeric(period), text(time));

        return {
            type: "scoring",
            period: numeric(period),
            time: computePeriodTime(text(time)) / 1000, // period time in seconds since start of period`
            note: text(note) !== "" ? text(note) : undefined,
            player: players[numeric(scorer)],
            assists: [numeric(assist1), numeric(assist2)].filter(n => !isNaN(n)).map(n => players[n]),
            '@timestamp':  timestamp,
        };
    };

    const parsePenalties = (players, element) => {
        var period, player, infraction, minutes, off_ice, start, end, on_ice;
        [period, player, infraction, minutes, off_ice, start, end, on_ice] = element.querySelectorAll("td")
        const timestamp = computeTimestamp(numeric(period), text(off_ice));

        return {
            type: "penalty",
            period: numeric(period),
            minutes: numeric(minutes),
            off_ice: computePeriodTime(text(off_ice)) / 1000, // period time in seconds since start of period`
            infraction: text(infraction).toLowerCase(),
            player: players[numeric(player)],
            '@timestamp':  timestamp,
        };
    };
    const events = [];
    events.push.apply(events, Array.from(document.querySelectorAll(selectors.homeScoring)).map(s => parseScoring(team.home.players, s)).map(i => { i.team = team.home.name; return i; }));
    events.push.apply(events, Array.from(document.querySelectorAll(selectors.visitorScoring)).map(s => parseScoring(team.visitor.players, s)).map(i => { i.team = team.visitor.name; return i; }));
    events.push.apply(events, Array.from(document.querySelectorAll(selectors.homePenalties)).map(s => parsePenalties(team.home.players, s)).map(i => { i.team = team.home.name; return i; }));
    events.push.apply(events, Array.from(document.querySelectorAll(selectors.visitorPenalties)).map(s => parsePenalties(team.visitor.players, s)).map(i => { i.team = team.visitor.name; return i; }));
    events.sort((a, b) => a["@timestamp"].valueOf() - b["@timestamp"].valueOf());

    events.map(i => Object.assign(i, base_event));

    // call .toJSON on the timestamp because Chrome->Node transit doesn't seem to understand how to 
    // transmit a Date object (it sends {} instead of the Date object)
    return {
        team: team,
        events: events.map(i => { i["@timestamp"] = i["@timestamp"].toJSON(); return i; }),
    }
}; // parse

exports.parse = parse;