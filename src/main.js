const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let lives = 3;
const hazards = [];
let spawnTimer = 0;
let score = 0;
let difficultyLevel = 0;
let difficultyTimer = 0;
const difficultyStepSeconds = 10; // increase difficulty every 10 seconds
let gameState = "playing"; // can be "playing" or "gameOver"

const baseSpawnInterval = 1.5; // base spawn interval in seconds
const minSpawnInterval = 0.35; // minimum spawn interval in seconds

let flashTimer = 0; // Visual flash for diffulty increase
let spawnInterval = baseSpawnInterval; // current spawn interval, starts at base

// Spawn Interval Helper
function recomputeSpawnInterval() {
    // Each difficulty level makes spawns faster but never goes below the minimum
    const next = baseSpawnInterval - difficultyLevel * 0.15;
    spawnInterval = Math.max(minSpawnInterval, next);
}

recomputeSpawnInterval(); // initialize spawn interval based on initial difficulty

// --- Game data (state) ---
const player = {
    x: 50,
    y: 400,
    w: 40,
    h: 40,
    vx: 0, // pixels per second (speed)
    speed: 300, // pixels per second when holding a key
};

// Key tracking
const keys = {
    left: false,
    right: false,
};

// Keyboard listeners
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
    if (e.key === "r" || e.key === "R") {
        if (gameState === "gameOver") resetGame();
    }
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
});

let lastTime = 0; // stores the previous timestamp

// Spawns a new hazard at the top of the screen with random properties
function spawnHazard() {
    const size = 30 + Math.random() * 20; // random size between 30 and 50

    hazards.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        w: size,
        h: size,
        vy: 150 + Math.random() * 100, // random speed between 100 and 250
    });
}

function update(dt) {
    if (gameState !== "playing") return;
    score += dt; // increase score based on time survived

    // Increase difficulty over time
    difficultyTimer += dt;
    if (difficultyTimer >= difficultyStepSeconds) {
        difficultyTimer -= difficultyStepSeconds; // stays stable even if a frame stutters
        difficultyLevel++;
        recomputeSpawnInterval(); // update spawn interval based on new difficulty

        flashTimer = 0.35; // flash for 0.35 seconds so you NOTICE the increase
    }

    if (flashTimer > 0) flashTimer -= dt; // count down flash timer

    // Update spawn timer and spawn hazards
    spawnTimer += dt;

    if (spawnTimer >= spawnInterval) {
        spawnHazard();
        spawnTimer = 0;
    }

    for (let hazard of hazards) {
        hazard.y += hazard.vy * dt; // move hazard down
    }

    for (let i = hazards.length - 1; i >= 0; i--) {
        if (hazards[i].y > canvas.height) {
            hazards.splice(i, 1); // remove hazard if it goes off screen
        }
    }

    for (let i = hazards.length - 1; i >= 0; i--) {
        const h = hazards[i];
        
        const collision =
            player.x < h.x + h.w &&
            player.x + player.w > h.x &&
            player.y < h.y + h.h &&
            player.y + player.h > h.y;

        if (collision) {
            hazards.splice(i, 1);
            lives--;

            if (lives <= 0) {
                gameState = "gameOver";
            }
        }
    }

    // Convert key state into velocity (intent -> motion)
    if (keys.left && !keys.right) player.vx = -player.speed;
    else if (keys.right && !keys.left) player.vx = player.speed;
    else player.vx = 0;

    // Apply motion using dt
    player.x += player.vx * dt;

    // Clamp to screen (no bouncing)
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
}

function render() {
    // Background color shifts with difficulty; flash turns it bright briefly
    let bg = 245 - difficultyLevel * 8; // gets darker over time
    bg = Math.max(180, bg); // clamp so it doesn't get too dark
    if (flashTimer > 0) bg = 255; // flash on level up

    ctx.fillStyle = `rgb(${bg}, ${bg}, ${bg})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset to black for normal drawing
    ctx.fillStyle = "black";

    // Draw UI text
    ctx.font = "20px system-ui";
    ctx.fillText(`Score: ${Math.floor(score)}`, 20, 30);
    ctx.fillText(`Lives: ${lives}`, 20, 55);
    ctx.fillText(`Level: ${difficultyLevel}`, 20, 80);

    for (let hazard of hazards) {
        ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
    }

    // Draw the player
    ctx.fillRect(player.x, player.y, player.w, player.h);

    if (gameState === "gameOver") {
        ctx.fillStyle = "black";
        ctx.font = "48px system-ui";
        ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
        ctx.font = "22px system-ui";
        ctx.fillText("Press R to Restart", canvas.width / 2 - 110, canvas.height / 2 + 40);
    }
}

function loop(timestamp) {
    // timestamp is in milliseconds, convert to seconds
    if (lastTime === 0) lastTime = timestamp; // first frame, initialize lastTime
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(dt);
    render();
    requestAnimationFrame(loop);
}

// Start the loop
requestAnimationFrame(loop);

function resetGame() {
    lives = 3;
    score = 0;

    hazards.length = 0; // clear hazards

    spawnTimer = 0;

    difficultyLevel = 0;
    difficultyTimer = 0;
    flashTimer = 0;

    spawnInterval = baseSpawnInterval; // reset spawn interval
    recomputeSpawnInterval(); // ensure spawn interval is correct for reset difficulty

    gameState = "playing";

    // Reset player position
    player.x = (canvas.width - player.w) / 2;
    player.vx = 0;
}