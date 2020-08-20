"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300) rotate(170)")
        .attr("data-invincibility", "true")
        .attr("visibility", "visible");
    let ship = new Elem(svg, "polygon", g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill: none; stroke: white; stroke-width: 1");
    let level = 1, lives = 3, score = 0, triggerBGM = true, movement = [], asteroids = generateAsteroids(3, []), lasers = [], bgm = new Audio("audio/Into the Stars.wav");
    const CANVAS_WIDTH = 600, CANVAS_HEIGHT = 600, ROTATION = 8, SHIP_SIZE = 20, LASER_SPEED = 30;
    const xRegex = /(?<=translate\()[+-]?([0-9]*[.])?[0-9]+/g, yRegex = /[+-]?([0-9]*[.])?[0-9]+(?=\) rotate)/g, angleRegex = /(?<=rotate\()[+-]?([0-9]*[.])?[0-9]+(?=\))/g;
    const gameLoop = Observable.interval(20), keyDown = Observable.fromEvent(document, "keydown"), keyUp = Observable.fromEvent(document, "keyup"), observeMovement = Observable.fromArray(movement), observeAsteroid = Observable.fromArray(asteroids), observeLaser = Observable.fromArray(lasers);
    keyDown
        .subscribe(event => movement[event.keyCode] = true);
    keyUp
        .subscribe(event => movement[event.keyCode] = false);
    gameLoop.forEach(() => observeMovement)
        .filter(() => movement[37])
        .filter(() => lives > 0)
        .map(_ => ({
        x: Number(g.attr("transform").match(xRegex)),
        y: Number(g.attr("transform").match(yRegex)),
        angle: Number(g.attr("transform").match(angleRegex)) - ROTATION
    }))
        .subscribe(({ x, y, angle }) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    gameLoop.forEach(() => observeMovement)
        .filter(() => movement[39])
        .filter(() => lives > 0)
        .map(_ => ({
        x: Number(g.attr("transform").match(xRegex)),
        y: Number(g.attr("transform").match(yRegex)),
        angle: Number(g.attr("transform").match(angleRegex)) + ROTATION
    }))
        .subscribe(({ x, y, angle }) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    gameLoop.forEach(() => observeMovement)
        .filter(() => movement[38])
        .filter(() => lives > 0)
        .map(_ => ({
        x: Number(g.attr("transform").match(xRegex)),
        y: Number(g.attr("transform").match(yRegex)),
        angle: Number(g.attr("transform").match(angleRegex))
    }))
        .map(({ x, y, angle }) => ({
        x: x + 4 * Math.sin(angle / 180 * Math.PI),
        y: y - 4 * Math.cos(angle / 180 * Math.PI),
        angle: angle
    }))
        .subscribe(({ x, y, angle }) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    Observable.interval(100)
        .forEach(() => keyDown)
        .filter(() => movement[32])
        .filter(() => lives > 0)
        .map(_ => ({
        shipX: Number(g.attr("transform").match(xRegex)),
        shipY: Number(g.attr("transform").match(yRegex)),
        shipAngle: Number(g.attr("transform").match(angleRegex))
    }))
        .subscribe(({ shipX, shipY, shipAngle }) => {
        lasers.push(new Elem(svg, "circle")
            .attr("id", "laser")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 4)
            .attr("style", "fill: none; stroke: white; stroke-width: 1")
            .attr("transform", "translate(" + String(shipX) + " " + String(shipY) + ") rotate(" + String(shipAngle) + ")"));
        new Audio("audio/fire.wav").play();
    });
    Observable.interval(3000)
        .subscribe(() => g.attr("data-invincibility", "false"));
    Observable.interval(10)
        .filter(() => g.attr("data-invincibility") == "true")
        .subscribe(() => g.attr("visibility", "visible"));
    Observable.interval(20)
        .filter(() => g.attr("data-invincibility") == "true")
        .subscribe(() => g.attr("visibility", "hidden"));
    gameLoop
        .map(_ => Number(g.attr("transform").match(xRegex)))
        .filter(shipX => shipX < 0 - SHIP_SIZE)
        .map(_ => ({
        x: CANVAS_WIDTH + SHIP_SIZE,
        y: Number(g.attr("transform").match(yRegex)),
        angle: Number(g.attr("transform").match(angleRegex))
    }))
        .subscribe(({ x, y, angle }) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    gameLoop
        .map(_ => Number(g.attr("transform").match(xRegex)))
        .filter(shipX => shipX > CANVAS_WIDTH + SHIP_SIZE)
        .map(_ => ({
        x: 0 - SHIP_SIZE,
        y: Number(g.attr("transform").match(yRegex)),
        angle: Number(g.attr("transform").match(angleRegex))
    }))
        .subscribe(({ x, y, angle }) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    gameLoop
        .map(_ => Number(g.attr("transform").match(yRegex)))
        .filter(shipY => shipY < 0 - SHIP_SIZE)
        .map(_ => ({
        x: Number(g.attr("transform").match(xRegex)),
        y: CANVAS_HEIGHT + SHIP_SIZE,
        angle: Number(g.attr("transform").match(angleRegex))
    }))
        .subscribe(({ x, y, angle }) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    gameLoop
        .map(_ => Number(g.attr("transform").match(yRegex)))
        .filter(shipY => shipY > CANVAS_HEIGHT + SHIP_SIZE)
        .map(_ => ({
        x: Number(g.attr("transform").match(xRegex)),
        y: 0 - SHIP_SIZE,
        angle: Number(g.attr("transform").match(angleRegex))
    }))
        .subscribe(({ x, y, angle }) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    gameLoop.flatMap(() => observeAsteroid)
        .map(asteroid => ({
        x: Number(asteroid.attr("transform").match(xRegex)) + Number(asteroid.attr("data-velocity-x")),
        y: Number(asteroid.attr("transform").match(yRegex)) + Number(asteroid.attr("data-velocity-y")),
        angle: Number(asteroid.attr("transform").match(angleRegex)),
        asteroid: asteroid
    }))
        .subscribe(({ x, y, angle, asteroid }) => asteroid.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    gameLoop.flatMap(() => observeAsteroid)
        .filter(asteroid => Math.sqrt(Math.pow(Number(asteroid.attr("transform").match(xRegex)) -
        Number(g.attr("transform").match(xRegex)), 2) +
        Math.pow(Number(asteroid.attr("transform").match(yRegex)) -
            Number(g.attr("transform").match(yRegex)), 2))
        < Number(asteroid.attr("r")) + SHIP_SIZE)
        .filter(() => g.attr("data-invincibility") == "false")
        .subscribe(_ => {
        g.attr("transform", "translate(300 300) rotate(170)")
            .attr("data-invincibility", "true");
        lives > 0
            ? (document.getElementById("lives").innerHTML = "&#9651;".repeat(--lives),
                new Audio("audio/oof.wav").play())
            : null;
    });
    gameLoop.flatMap(() => observeAsteroid)
        .subscribe(asteroid => Number(asteroid.attr("transform").match(xRegex)) < 0 - Number(asteroid.attr("r")) * 2 ?
        asteroid.attr("transform", "translate(" +
            String(CANVAS_WIDTH + Number(asteroid.attr("r"))) + " " +
            String(Number(asteroid.attr("transform").match(yRegex))) +
            ") rotate(" + String(Number(asteroid.attr("transform").match(angleRegex))) + ")")
        : null);
    gameLoop.flatMap(() => observeAsteroid)
        .subscribe(asteroid => Number(asteroid.attr("transform").match(xRegex)) > CANVAS_WIDTH + Number(asteroid.attr("r")) * 2 ?
        asteroid.attr("transform", "translate(" +
            String(0 - Number(asteroid.attr("r"))) + " " +
            String(Number(asteroid.attr("transform").match(yRegex))) +
            ") rotate(" + String(Number(asteroid.attr("transform").match(angleRegex))) + ")")
        : null);
    gameLoop.flatMap(() => observeAsteroid)
        .subscribe(asteroid => Number(asteroid.attr("transform").match(yRegex)) < 0 - Number(asteroid.attr("r")) * 2 ?
        asteroid.attr("transform", "translate(" +
            String(Number(asteroid.attr("transform").match(xRegex))) + " " +
            String(CANVAS_HEIGHT + Number(asteroid.attr("r"))) +
            ") rotate(" + String(Number(asteroid.attr("transform").match(angleRegex))) + ")")
        : null);
    gameLoop.flatMap(() => observeAsteroid)
        .subscribe(asteroid => Number(asteroid.attr("transform").match(yRegex)) > CANVAS_HEIGHT + Number(asteroid.attr("r")) * 2 ?
        asteroid.attr("transform", "translate(" +
            String(Number(asteroid.attr("transform").match(xRegex))) + " " +
            String(0 - Number(asteroid.attr("r"))) +
            ") rotate(" + String(Number(asteroid.attr("transform").match(angleRegex))) + ")")
        : null);
    gameLoop.flatMap(() => observeAsteroid)
        .subscribe(asteroid => Number(asteroid.attr("r")) < 20
        ? (asteroid.elem.remove(),
            asteroids.splice(asteroids.indexOf(asteroid), 1)) : null);
    gameLoop.flatMap(() => observeLaser)
        .subscribe(laser => laser.attr("transform", "translate(" +
        String(Number(laser.attr("transform").match(xRegex))
            + LASER_SPEED * Math.sin(Number(laser.attr("transform").match(angleRegex)) / 180 * Math.PI)) + " " +
        String(Number(laser.attr("transform").match(yRegex))
            - LASER_SPEED * Math.cos(Number(laser.attr("transform").match(angleRegex)) / 180 * Math.PI)) +
        ") rotate(" + laser.attr("transform").match(angleRegex) + ")"));
    gameLoop.flatMap(() => observeLaser)
        .subscribe(laser => Number(laser.attr("transform").match(xRegex)) < 0 - 50 ||
        Number(laser.attr("transform").match(xRegex)) > CANVAS_WIDTH + 50 ||
        Number(laser.attr("transform").match(yRegex)) < 0 - 50 ||
        Number(laser.attr("transform").match(yRegex)) > CANVAS_HEIGHT + 50
        ? (laser.elem.remove(),
            lasers.splice(lasers.indexOf(laser), 1)) : null);
    Observable.interval(1).flatMap(() => observeLaser)
        .flatMap(laser => observeAsteroid
        .map(asteroid => Math.sqrt(Math.pow(Number(asteroid.attr("transform").match(xRegex)) -
        Number(laser.attr("transform").match(xRegex)), 2) +
        Math.pow(Number(asteroid.attr("transform").match(yRegex)) -
            Number(laser.attr("transform").match(yRegex)), 2))
        < Number(asteroid.attr("r"))
        ? ({ asteroid: asteroid,
            laser: laser })
        : ({ asteroid: null,
            laser: null })))
        .subscribe(({ asteroid, laser }) => asteroid != null && laser != null
        ? (generateSmallerAsteroids(asteroid, laser),
            new Audio("audio/explosion.wav").play()) : null);
    gameLoop
        .filter(() => asteroids.length == 0)
        .subscribe(() => {
        g.attr("transform", "translate(300 300) rotate(170)")
            .attr("data-invincibility", "true");
        document.getElementById("level").innerHTML = "Level " + String(++level);
        asteroids = generateAsteroids(3 + level, asteroids);
        new Audio("audio/level-up-mario.wav").play();
    });
    gameLoop
        .filter(() => lives == 0)
        .subscribe(() => {
        g.elem.remove();
        ship.elem.remove();
        movement = [];
        document.getElementById("level").innerHTML = "Game Over!";
        document.getElementById("lives").innerHTML = "Score: " + String(score);
        document.getElementById("score").innerHTML = "";
    });
    keyDown
        .filter(() => triggerBGM)
        .subscribe(() => {
        triggerBGM = false;
        bgm.play();
        bgm.loop = true;
        bgm.volume = 0.8;
    });
    function generateAsteroids(numberOfAsteroids, array) {
        const x = Math.random() * 601, y = Math.random() * 601;
        return numberOfAsteroids
            ? (x < 10 || x > 590)
                ? (array.push(new Elem(svg, "circle")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", 80)
                    .attr("style", "fill: none; stroke: white; stroke-width: 1")
                    .attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(0)")
                    .attr("data-velocity-x", String(Math.random() * (1.5 + 0.1 * level) * (Math.random() < 0.5 ? 1 : -1)))
                    .attr("data-velocity-y", String(Math.random() * (1.5 + 0.1 * level) * (Math.random() < 0.5 ? 1 : -1)))),
                    generateAsteroids(numberOfAsteroids - 1, array))
                : generateAsteroids(numberOfAsteroids, array)
            : array;
    }
    function generateSmallerAsteroids(asteroid, laser) {
        laser.elem.remove();
        asteroid.elem.remove(),
            asteroids.splice(asteroids.indexOf(asteroid), 1);
        lasers.splice(lasers.indexOf(laser), 1);
        asteroids.push(new Elem(svg, "circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", Number(asteroid.attr("r")) / 2)
            .attr("style", "fill: none; stroke: white; stroke-width: 1")
            .attr("transform", "translate(" + asteroid.attr("transform").match(xRegex) + " " +
            asteroid.attr("transform").match(yRegex) + ") rotate(0)")
            .attr("data-velocity-x", String(Math.random() * 1.5 * (Math.random() < 0.5 ? 1 : -1)))
            .attr("data-velocity-y", String(Math.random() * 1.5 * (Math.random() < 0.5 ? 1 : -1))));
        asteroids.push(new Elem(svg, "circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", Number(asteroid.attr("r")) / 2)
            .attr("style", "fill: none; stroke: white; stroke-width: 1")
            .attr("transform", "translate(" + asteroid.attr("transform").match(xRegex) + " " +
            asteroid.attr("transform").match(yRegex) + ") rotate(0)")
            .attr("data-velocity-x", String(Math.random() * (1.5 + 0.1 * level) * (Math.random() < 0.5 ? 1 : -1)))
            .attr("data-velocity-y", String(Math.random() * (1.5 + 0.1 * level) * (Math.random() < 0.5 ? 1 : -1))));
        document.getElementById("score").innerHTML = String(score += 50);
        document.getElementById("laser") != null
            ? document.getElementById("laser").remove()
            : null;
    }
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map