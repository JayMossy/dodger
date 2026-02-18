const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let lives = 3;
const hazards = [];
let spawnTimer = 0;
const spawnInterval = 1.5; // seconds between spawns
let score = 0;

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
    score += dt; // increase score based on time survived

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
                alert("Game Over");
                // Reset game state
                lives = 3;
                score = 0;
                hazards.length = 0; // clear hazards
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
    // Clear the screen every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw UI text
    ctx.font = "20px system-ui";
    ctx.fillText("Dodger - Loop Test", 20, 30);

    // Draw the player
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillText(`Score: ${Math.floor(score)}`, 20, 55);
    ctx.fillText(`Lives: ${lives}`, 20, 80);

    for (let hazard of hazards) {
        ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
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