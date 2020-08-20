// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

function asteroids() {
    // Inside this function you will use the classes and functions 
    // defined in svgelement.ts and observable.ts
    // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
    // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.

    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!
    // Explain which ideas you have used ideas from the lectures to 
    // create reusable, generic functions.
    const svg = document.getElementById("canvas")!;

    // Make a group for the spaceship and a transform to move it and rotate it
    // To animate the spaceship you will update the transform property
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300) rotate(170)")
        .attr("data-invincibility", "true")
        .attr("visibility", "visible");

    // Create a polygon shape for the space ship as a child of the transform group
    let ship = new Elem(svg, "polygon", g.elem) 
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill: none; stroke: white; stroke-width: 1");
    
    let
        level: number = 1,                                      // Game level
        lives: number = 3,                                      // Lives
        score: number = 0,                                      // Score
        triggerBGM = true,                                      // Trigger to play BGM
        movement: any = [],                                     // Array of KeyboardEvents
        asteroids: Array<Elem> = generateAsteroids(3, []),      // Array of asteroids
        lasers: Array<Elem> = [],                               // Array of lasers
        bgm = new Audio("audio/Into the Stars.wav");            // Background music composed by me!          
    
    const
        CANVAS_WIDTH = 600,                                     // Canvas width
        CANVAS_HEIGHT = 600,                                    // Canvas height
        ROTATION = 8,                                           // The degree of rotation of the ship
        SHIP_SIZE = 20,                                         // Rough estimate of the ship's size
        LASER_SPEED = 30;                                       // Laser's movement speed

    const
        // Regex for ship and asteroid's x, y and angle values
        xRegex = /(?<=translate\()[+-]?([0-9]*[.])?[0-9]+/g,
        yRegex = /[+-]?([0-9]*[.])?[0-9]+(?=\) rotate)/g,
        angleRegex = /(?<=rotate\()[+-]?([0-9]*[.])?[0-9]+(?=\))/g;
    
    const
        // Observables
        gameLoop = Observable.interval(20),
        keyDown = Observable.fromEvent<KeyboardEvent>(document, "keydown"),
        keyUp = Observable.fromEvent<KeyboardEvent>(document, "keyup"),
        observeMovement = Observable.fromArray(movement),
        observeAsteroid = Observable.fromArray(asteroids),
        observeLaser = Observable.fromArray(lasers);

    // This Asteroids game has endless number of stages. The player continues to play until they lose all of their lives
    // The total number of asteroids will start off with 3 and will be incremented by 1 for every new level
    // The asteroids' speed will also increase gradually for every new level
    // If the player's ship collides with an asteroid, their position resets to the centre and they are granted invincibility for 3 seconds
    // This is to prevent the ship from dying immediately if an asteroid so happens to be at the centre of the canvas and the ship respawns there
    // Explosion and shooting sounds are taken from http://www.classicgaming.cc/classics/asteroids/sounds
    // Level up sound is taken from https://www.zedge.net/find/ringtones/level%20up%20sound
    // Death sound is taken from https://www.myinstants.com/instant/roblox-oof/
    // BGM is originally made by myself using FL Studio
    
    
    
    // SHIP =======================================================================================================================================
    
    // The method on how the ship's x and y positions and angle are retrieved is done by using regex.
    // By calling g.attr("transform"), it will return the transform attribute's current value as a string which is as such:
    // "translate (x y) rotate(angle)"
    // As such, we use regex whenever we need to obtain the current values of x, y and angle of the ship and update its position

    // Populate the array indexed by the event's keyCode
    keyDown
        .subscribe(event => movement[event.keyCode] = true);
    
    // Clear the array entry for the event's keyCode
    keyUp
        .subscribe(event => movement[event.keyCode] = false);

    // Rotate the ship left    
    gameLoop.forEach(() => observeMovement)
        .filter(() => movement[37])                               // Filters out the inputs that are left arrow keys only
        .filter(() => lives > 0)                                  // Only allow shooting if the player is still alive
        .map(_ => ({                                              // Regex is used to get the x, y and angle of the ship in its transform property
            x: Number(g.attr("transform").match(xRegex)),
            y: Number(g.attr("transform").match(yRegex)),
            angle: Number(g.attr("transform").match(angleRegex)) - ROTATION
        })) // Rotate the ship counterclockwise by 10 degrees
        .subscribe(({x, y, angle}) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    
    // Rotate the ship right
    gameLoop.forEach(() => observeMovement)
        .filter(() => movement[39])                               // Filters out the inputs that are right arrow keys only
        .filter(() => lives > 0)                                  // Only allow shooting if the player is still alive
        .map(_ => ({                                              // Regex is used to get the x, y and angle of the ship in its transform property
            x: Number(g.attr("transform").match(xRegex)),
            y: Number(g.attr("transform").match(yRegex)),
            angle: Number(g.attr("transform").match(angleRegex)) + ROTATION
        })) // Rotate the ship clockwise by 10 degrees
        .subscribe(({x, y, angle}) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    
    // Thrust the ship
    gameLoop.forEach(() => observeMovement)
        .filter(() => movement[38])                             // Filters out the inputs that are up arrow keys only
        .filter(() => lives > 0)                                // Only allow shooting if the player is still alive
        .map(_ => ({                                            // Regex is used to get the x, y and angle of the ship in its transform property
            x: Number(g.attr("transform").match(xRegex)),
            y: Number(g.attr("transform").match(yRegex)),
            angle: Number(g.attr("transform").match(angleRegex))
        }))
        .map(({x, y, angle}) => ({
            x: x + 4 * Math.sin(angle / 180 * Math.PI),         // Calculate the x direction of the ship that it should face
            y: y - 4 * Math.cos(angle / 180 * Math.PI),         // Calculate the y direction of the ship that it should face
            angle: angle
        }))
        .subscribe(({x, y, angle}) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    
    // Create laser
    Observable.interval(100)
        .forEach(() => keyDown)
        .filter(() => movement[32])                             // Filters out the inputs that are space bar only
        .filter(() => lives > 0)                                // Only allow shooting if the player is still alive
        .map(_ => ({                                            // Regex is used to get the x, y position of the ship in its transform property
            shipX: Number(g.attr("transform").match(xRegex)),
            shipY: Number(g.attr("transform").match(yRegex)),
            shipAngle: Number(g.attr("transform").match(angleRegex))
        }))
        .subscribe(({shipX, shipY, shipAngle}) => {
            lasers.push(
                new Elem(svg, "circle")
                    .attr("id", "laser")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", 4)
                    .attr("style", "fill: none; stroke: white; stroke-width: 1")
                    .attr("transform", "translate(" + String(shipX) + " " + String(shipY) + ") rotate(" + String(shipAngle) + ")"));
            new Audio("audio/fire.wav").play();                  // Play shooting sound
            });
    
    // Remove invincibility after 3 seconds
    Observable.interval(3000)
        .subscribe(() => g.attr("data-invincibility", "false"));
    
    // The following 2 Observables below are responsible for making the ship blink, indicating that it is invincible
    Observable.interval(10)
        .filter(() => g.attr("data-invincibility") == "true")
        .subscribe(() => g.attr("visibility", "visible"));

    Observable.interval(20)
        .filter(() => g.attr("data-invincibility") == "true")
        .subscribe(() => g.attr("visibility", "hidden"));
    
    
    // The next 4 Observables handle the position of the ship if it goes off the edge of the canvas
    // SHIP_SIZE is used as an added offset so that the ship will only reappear on the other edge of the screen
    // once the ship is totally out of sight on the canvas
    // This is because if the SHIP_SIZE offset is not added, once the ship's actual x and y coordinates go off the canvas 
    // (which are located the centre point of the ship), the entire ship will give a weird teleporting impression
    // Hence we give a rough offset for the ship named SHIP_SIZE which holds the value of 20
    
    // Reposition the ship to the right side of the canvas if its x position is too far off the left edge
    gameLoop
        .map(_ => Number(g.attr("transform").match(xRegex)))
        .filter(shipX => shipX < 0 - SHIP_SIZE)                 // Filters the ship's x positions that are too far off the left side of the canvas
        .map(_ => ({
            x: CANVAS_WIDTH + SHIP_SIZE,                        // Reposition back the ship to be on the right side of the canvas
            y: Number(g.attr("transform").match(yRegex)),
            angle: Number(g.attr("transform").match(angleRegex))
        }))
        .subscribe(({x, y, angle}) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    
    // Reposition the ship to the left side of the canvas if its x position is too far off the right edge
    gameLoop
        .map(_ => Number(g.attr("transform").match(xRegex)))
        .filter(shipX => shipX > CANVAS_WIDTH + SHIP_SIZE)       // Filters the ship's x positions that are too far off the right side of the canvas
        .map(_ => ({
            x: 0 - SHIP_SIZE,                                    // Reposition back the ship to be on the left side of the canvas
            y: Number(g.attr("transform").match(yRegex)),
            angle: Number(g.attr("transform").match(angleRegex))
        }))
        .subscribe(({x, y, angle}) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    
    // Reposition the ship to the bottom side of the canvas if its y position is too far off the top edge
    gameLoop
        .map(_ => Number(g.attr("transform").match(yRegex)))
        .filter(shipY => shipY < 0 - SHIP_SIZE)                  // Filters the ship's y positions that are too far off the top side of the canvas
        .map(_ => ({
            x: Number(g.attr("transform").match(xRegex)),
            y: CANVAS_HEIGHT + SHIP_SIZE,                        // Reposition back the ship to be on the bottom side of the canvas
            angle: Number(g.attr("transform").match(angleRegex))
        }))
        .subscribe(({x, y, angle}) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    
    // Reposition the ship to the top side of the canvas if its y position is too far off the bottom edge
    gameLoop
        .map(_ => Number(g.attr("transform").match(yRegex)))
        .filter(shipY => shipY > CANVAS_HEIGHT + SHIP_SIZE)      // Filters the ship's y positions that are too far off the bottom side of the canvas
        .map(_ => ({
            x: Number(g.attr("transform").match(xRegex)),
            y: 0 - SHIP_SIZE,                                    // Reposition back the ship to be on the top side of the canvas
            angle: Number(g.attr("transform").match(angleRegex))
        }))
        .subscribe(({x, y, angle}) => g.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    
    
    
    // ASTEROIDS ==================================================================================================================================
    
    // Same as the ship, we obtain the asteroids' x, y and angle values by using regex

    // Move the asteroid by adding its current x and y position with the custom attribute velocity-x and velocity-y respectively to change
    // their current position
    gameLoop.flatMap(() => observeAsteroid)
        .map(asteroid => ({
            x: Number(asteroid.attr("transform").match(xRegex)) + Number(asteroid.attr("data-velocity-x")),
            y: Number(asteroid.attr("transform").match(yRegex)) + Number(asteroid.attr("data-velocity-y")),
            angle: Number(asteroid.attr("transform").match(angleRegex)),
            asteroid: asteroid
        }))
        .subscribe(({x, y, angle, asteroid}) =>
            asteroid.attr("transform", "translate(" + String(x) + " " + String(y) + ") rotate(" + String(angle) + ")"));
    
    // Detect the collision between the ship and the asteroids
    // Upon collision, reset the ship's position
    gameLoop.flatMap(() => observeAsteroid)
        .filter(asteroid => 
            // We are calculating the distance between the ship and the asteroid using the formula of the distance between 2 points:
            // Math.sqrt(Math.pow(asteroid.x - ship.x, 2) + Math.pow(asteroid.y - ship.y, 2)) < asteroid.radius + SHIP_SIZE
            Math.sqrt(
                Math.pow(
                    Number(asteroid.attr("transform").match(xRegex)) - 
                    Number(g.attr("transform").match(xRegex)), 2) +
                Math.pow(
                    Number(asteroid.attr("transform").match(yRegex)) -
                    Number(g.attr("transform").match(yRegex)), 2))
            < Number(asteroid.attr("r")) + SHIP_SIZE)
        .filter(() => g.attr("data-invincibility") == "false")
        .subscribe(_ => {
            g.attr("transform", "translate(300 300) rotate(170)")                                  // Reset position of the ship
             .attr("data-invincibility", "true");                                                  // Grant invincibility
            lives > 0 
                ? ( 
                    document.getElementById("lives")!.innerHTML = "&#9651;".repeat(--lives),
                    new Audio("audio/oof.wav").play())                                             // Play death sound (O O F)
                : null;                                                                            // Remove 1 life if ship is still alive
        });
    
    
    // The next 4 Observables handle the position of the asteroids if they go off the edge of the canvas
    // The formula to calculate them is exactly the same as the one for the ship except the offset we are using is
    // ASTEROID_SIZE instead
    
    // Reposition the asteroid to the right side of the canvas if its x position is too far off the left edge
    gameLoop.flatMap(() => observeAsteroid)
        // Check if the x position < 0 - ASTEROID_SIZE
        // If true, reposition the asteroid so that it reappear on the right side of the canvas, else maintain its current position
        .subscribe(asteroid =>
            Number(asteroid.attr("transform").match(xRegex)) < 0 - Number(asteroid.attr("r")) * 2 ?
                asteroid.attr("transform", 
                    "translate(" + 
                    String(CANVAS_WIDTH + Number(asteroid.attr("r"))) + " " + 
                    String(Number(asteroid.attr("transform").match(yRegex))) + 
                    ") rotate(" + String(Number(asteroid.attr("transform").match(angleRegex))) + ")") 
                : null);        
    
    // Reposition the asteroid to the left side of the canvas if its x position is too far off the right edge
    gameLoop.flatMap(() => observeAsteroid)
        // Check if the x position > CANVAS_WIDTH + ASTEROID_SIZE
        // If true, reposition the asteroid so that it reappear on the left side of the canvas, else maintain its current position
        .subscribe(asteroid => 
            Number(asteroid.attr("transform").match(xRegex)) > CANVAS_WIDTH + Number(asteroid.attr("r")) * 2 ?
                asteroid.attr("transform", 
                    "translate(" + 
                    String(0 - Number(asteroid.attr("r"))) + " " + 
                    String(Number(asteroid.attr("transform").match(yRegex))) + 
                    ") rotate(" + String(Number(asteroid.attr("transform").match(angleRegex))) + ")") 
                : null);
    
    // Reposition the asteroid to the bottom side of the canvas if its y position is too far off the top edge
    gameLoop.flatMap(() => observeAsteroid)
        // Check if the y position < 0 - ASTEROID_SIZE
        // If true, reposition the asteroid so that it reappear on the bottom side of the canvas, else maintain its current position
        .subscribe(asteroid => 
            Number(asteroid.attr("transform").match(yRegex)) < 0 - Number(asteroid.attr("r")) * 2 ?
                asteroid.attr("transform", 
                    "translate(" + 
                    String(Number(asteroid.attr("transform").match(xRegex))) + " " + 
                    String(CANVAS_HEIGHT + Number(asteroid.attr("r"))) + 
                    ") rotate(" + String(Number(asteroid.attr("transform").match(angleRegex))) + ")") 
                : null);
    
    // Reposition the asteroid to the top side of the canvas if its y position is too far off the bottom edge
    gameLoop.flatMap(() => observeAsteroid)
        // Check if the y position > CANVAS_HEIGHT + ASTEROID_SIZE
        // If true, reposition the asteroid so that it reappear on the top side of the canvas, else maintain its current position
        .subscribe(asteroid => 
            Number(asteroid.attr("transform").match(yRegex)) > CANVAS_HEIGHT + Number(asteroid.attr("r")) * 2 ?
                asteroid.attr("transform", 
                    "translate(" + 
                    String(Number(asteroid.attr("transform").match(xRegex))) + " " + 
                    String(0 - Number(asteroid.attr("r"))) + 
                    ") rotate(" + String(Number(asteroid.attr("transform").match(angleRegex))) + ")") 
                : null);
    
    // Remove the asteroid from the array and canvas when its radius is less than 20 (that means it is fully destroyed)
    gameLoop.flatMap(() => observeAsteroid)
        .subscribe(asteroid => Number(asteroid.attr("r")) < 20
            ? (
                asteroid.elem.remove(),                             // Remove the asteroid from the canvas
                asteroids.splice(asteroids.indexOf(asteroid), 1)    // Remove the asteroid from the array
            ) : null)
    
    
    
    // LASER ======================================================================================================================================
    
    // Move the laser
    // Formula to move the laser is exactly the same as the formula used to thrust the ship
    gameLoop.flatMap(() => observeLaser)
        .subscribe(laser => 
            laser.attr("transform", 
            "translate(" + 
            String(Number(laser.attr("transform").match(xRegex)) 
                    + LASER_SPEED * Math.sin(Number(laser.attr("transform").match(angleRegex)) / 180 * Math.PI)) + " " + 
            String(Number(laser.attr("transform").match(yRegex)) 
                    - LASER_SPEED * Math.cos(Number(laser.attr("transform").match(angleRegex)) / 180 * Math.PI)) + 
            ") rotate(" + laser.attr("transform").match(angleRegex) + ")"));
    
    // If a laser goes off the edge of the screen, remove the laser from the array and from the canvas
    gameLoop.flatMap(() => observeLaser)
        .subscribe(laser => 
            Number(laser.attr("transform").match(xRegex)) < 0 - 50 || 
            Number(laser.attr("transform").match(xRegex)) > CANVAS_WIDTH + 50 ||
            Number(laser.attr("transform").match(yRegex)) < 0 - 50 || 
            Number(laser.attr("transform").match(yRegex)) > CANVAS_HEIGHT + 50
            ? (
                laser.elem.remove(),                        // Remove laser from the canvas
                lasers.splice(lasers.indexOf(laser), 1)     // Remove laser from the array
            ) : null);
    
    // Break an asteroid into 2 smaller asteroids when a laser 
    Observable.interval(1).flatMap(() => observeLaser)
        .flatMap(laser => 
            observeAsteroid
                .map(asteroid => 
                    // We are calculating the distance between the laser and the asteroid using the formula of the distance between 2 points:
                    // Math.sqrt(Math.pow(asteroid.x - laser.x, 2) + Math.pow(asteroid.y - laser.y, 2)) < asteroid.radius
                    Math.sqrt(
                        Math.pow(
                            Number(asteroid.attr("transform").match(xRegex)) - 
                            Number(laser.attr("transform").match(xRegex)), 2) +
                        Math.pow(
                            Number(asteroid.attr("transform").match(yRegex)) -
                            Number(laser.attr("transform").match(yRegex)), 2))
                    < Number(asteroid.attr("r"))
                    ? ({asteroid: asteroid, 
                        laser: laser}) 
                    : ({asteroid: null, 
                        laser: null})))                                              
        .subscribe(({asteroid, laser}) => asteroid != null && laser != null
            ? (
                generateSmallerAsteroids(asteroid, laser),
                new Audio("audio/explosion.wav").play()       // Play explosion sound for destroying an asteroid
                ) : null);
            
    
    
    
    // MISCELLANEOUS ==============================================================================================================================
    
    // New level when all asteroids are destroyed
    gameLoop
        .filter(() => asteroids.length == 0)
        .subscribe(() => {
            g.attr("transform", "translate(300 300) rotate(170)")                           // Restart position
             .attr("data-invincibility", "true");                                           // Grant invincibility at the start of a new level
            document.getElementById("level")!.innerHTML = "Level " + String(++level);       // Increase level
            asteroids = generateAsteroids(3 + level, asteroids);                            // Generate more asteroids based on the level
            new Audio("audio/level-up-mario.wav").play();                                   // Play level up sound
        })
    
    // Game Over
    gameLoop
        .filter(() => lives == 0)
        .subscribe(() => {
            g.elem.remove();
            ship.elem.remove();
            movement = [];
            document.getElementById("level")!.innerHTML = "Game Over!";
            document.getElementById("lives")!.innerHTML = "Score: " + String(score);
            document.getElementById("score")!.innerHTML = "";
        });
    
    // Play bgm once player starts moving
    // The bgm's title is called "Into the Stars", composed by me! :D 
    // Hope you like it!
    keyDown
        .filter(() => triggerBGM)
        .subscribe(() => {
            triggerBGM = false;
            bgm.play();
            bgm.loop = true
            bgm.volume = 0.8;
        })
    
    
    
    // FUNCTIONS ==================================================================================================================================
    
    /**
     * Function that returns an array of asteroid Elems by recursion
     * @param numberOfAsteroids The number of asteroids to be generated on the svg and stored into the array
     * @param array             The array to be returned that contains the asteroid Elems
     */
    function generateAsteroids(numberOfAsteroids: number, array: Array<Elem>): Array<Elem> {
        // Generate a random x and y coordinate for the asteroid that ranges from 0 - 600
        const
            x = Math.random() * 601,
            y = Math.random() * 601;
        
        // If the x coordinate is less than 10 or greater than 590, create the asteroid and push it into an array
        // This is to make sure the asteroid created does not spawn on the ship when the game starts
        // The asteroid we are creating is a circle
        // If the asteroid is added into the array, perform recursion on the next asteroid where the number of asteroids is deducted by 1
        // Else, perform recursion on the next asteroid but do not decrease the number of asteroids
        // Essentially, this recursion is similar to a do while loop
        return numberOfAsteroids
        ? (x < 10 || x > 590)
            ? (array.push(
                new Elem(svg, "circle")
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

    /**
     * Impure function to remove the laser and asteroid from the canvas when they collide as well as removing them from the array
     * using splice(). After that push 2 smaller asteroids into the asteroids array.
     * @param asteroid  The asteroid element to be removed
     * @param laser     The laser element to be removed
     */
    function generateSmallerAsteroids(asteroid: Elem, laser: Elem): void {
        laser.elem.remove();                                // Remove laser from the canvas
        asteroid.elem.remove(),                             // Remove asteroid from the canvas
        asteroids.splice(asteroids.indexOf(asteroid), 1);   // Remove asteroid from the array
        lasers.splice(lasers.indexOf(laser), 1);            // Remove laser from the array

        // Create 2 smaller asteroids
        asteroids.push(
            new Elem(svg, "circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", Number(asteroid.attr("r")) / 2)
                .attr("style", "fill: none; stroke: white; stroke-width: 1")
                .attr("transform", "translate(" + asteroid.attr("transform").match(xRegex) + " " + 
                    asteroid.attr("transform").match(yRegex) + ") rotate(0)")
                .attr("data-velocity-x", String(Math.random() * 1.5 * (Math.random() < 0.5 ? 1 : -1)))
                .attr("data-velocity-y", String(Math.random() * 1.5 * (Math.random() < 0.5 ? 1 : -1))));
        
        asteroids.push(
            new Elem(svg, "circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", Number(asteroid.attr("r")) / 2)
                .attr("style", "fill: none; stroke: white; stroke-width: 1")
                .attr("transform", "translate(" + asteroid.attr("transform").match(xRegex) + " " + 
                    asteroid.attr("transform").match(yRegex) + ") rotate(0)")
                .attr("data-velocity-x", String(Math.random() * (1.5 + 0.1 * level) * (Math.random() < 0.5 ? 1 : -1)))
                .attr("data-velocity-y", String(Math.random() * (1.5 + 0.1 * level) * (Math.random() < 0.5 ? 1 : -1))));
            
        document.getElementById("score")!.innerHTML = String(score += 50);    // Add score for destroying an asteroid
        
        // The code below will remove any additional lasers that are accidentally spliced out of the lasers array when a laser collides 
        // with an asteroid. This is a weird bug which I believe is due to side effects. :(
        // What I believed happened was when I spliced the laser that collided with the asteroid, the rest of the lasers in the array
        // are shifted in front, but somehow the new laser that replaces the removed laser's spot may have also been affected by splice()
        // during that timeframe and hence that laser was also removed.
        // I do not like this cheesy fix but I have to make do...
        document.getElementById("laser") != null
            ? document.getElementById("laser")!.remove()
            : null;
    }
}

// The following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
window.onload = () => {
    asteroids();
}