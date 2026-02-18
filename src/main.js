const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let lives = 3;

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

function update(dt) {
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

    ctx.fillText(`Lives: ${lives}`, 20, 55);
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