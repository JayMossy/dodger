const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- Game data (state) ---
const player = {
    x: 50,
    y: 400,
    w: 40,
    h: 40,
    vx: 120, // pixels per second (speed)
};

let lastTime = 0; // stores the previous timestamp

function update(dt) {
    // Move the player automatically to prove the loop works
    player.x += player.vx * dt;

    // Bounce off left/right edges
    if (player.x < 0) {
        player.x = 0;
        player.vx *= -1; // reverse direction
    }
    if (player.x + player.w > canvas.width) {
        player.x = canvas.width - player.w;
        player.vx *= -1; // reverse direction
    }
}

function render() {
    // Clear the screen every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw UI text
    ctx.font = "20px system-ui";
    ctx.fillText("Dodger - Loop Test", 20, 30);

    // Draw the player
    ctx.fillRect(player.x, player.y, player.w, player.h);
}

function loop(timestamp) {
    // timestamp is in milliseconds, convert to seconds
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);