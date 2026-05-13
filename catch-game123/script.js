// --------------------------
// AUTH SYSTEM
// --------------------------
let currentUser = null;

function showLogin() {
    document.getElementById('authTitle').textContent = "Login";
    document.getElementById('loginForm').style.display = "block";
    document.getElementById('registerForm').style.display = "none";
    document.getElementById('authMsg').textContent = "";
}

function showRegister() {
    document.getElementById('authTitle').textContent = "Register";
    document.getElementById('loginForm').style.display = "none";
    document.getElementById('registerForm').style.display = "block";
    document.getElementById('authMsg').textContent = "";
}

function registerUser() {
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    const msg = document.getElementById('authMsg');

    if (!email || !pass) return msg.textContent = "Fill all fields!";
    if (pass.length < 6) return msg.textContent = "Password must be at least 6 characters!";

    let users = JSON.parse(localStorage.getItem('gameUsers')) || {};
    if (users[email]) return msg.textContent = "Email already registered!";

    // Save new user
    users[email] = { password: pass, highScore: 0 };
    localStorage.setItem('gameUsers', JSON.stringify(users));
    msg.textContent = "✅ Registered! You can login now.";
    msg.style.color = "green";
    
    // Clear fields
    document.getElementById('regEmail').value = "";
    document.getElementById('regPass').value = "";
}

function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const msg = document.getElementById('authMsg');

    if (!email || !pass) return msg.textContent = "Fill all fields!";

    let users = JSON.parse(localStorage.getItem('gameUsers')) || {};
    if (!users[email] || users[email].password !== pass) {
        return msg.textContent = "❌ Wrong email or password!";
    }

    // Login success
    currentUser = email;
    showGameScreen();
}

function logoutUser() {
    currentUser = null;
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('authScreen').classList.add('active');
    showLogin();
}

function showGameScreen() {
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('userEmail').textContent = currentUser;
    
    // Load user's high score
    let users = JSON.parse(localStorage.getItem('gameUsers'));
    document.getElementById('highScore').textContent = users[currentUser].highScore;

    initGame();
}

// --------------------------
// GAME SYSTEM
// --------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 500;

let score = 0;
let isPlaying = false;
let basket = { x: 250, y: 450, width: 100, height: 40, speed: 8 };
let fallingItems = [];
let itemSpeed = 3;
let spawnRate = 80;
let frameCount = 0;

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
});

function initGame() {
    document.getElementById('startBtn').onclick = () => {
        if (!isPlaying) {
            resetGame();
            isPlaying = true;
            document.getElementById('startBtn').textContent = "Restart Game";
            gameLoop();
        } else {
            resetGame();
        }
    };
}

function createItem() {
    const types = ['🍎', '⭐', '💎', '🍌'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    fallingItems.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        size: 30,
        type: randomType
    });
}

function update() {
    if (leftPressed && basket.x > 0) basket.x -= basket.speed;
    if (rightPressed && basket.x < canvas.width - basket.width) basket.x += basket.speed;

    frameCount++;
    if (frameCount % spawnRate === 0) createItem();

    for (let i = 0; i < fallingItems.length; i++) {
        let item = fallingItems[i];
        item.y += itemSpeed;

        // Catch
        if (
            item.y + item.size >= basket.y &&
            item.x + item.size > basket.x &&
            item.x < basket.x + basket.width
        ) {
            score += 10;
            document.getElementById('score').textContent = score;
            fallingItems.splice(i, 1);
            i--;

            // Difficulty
            if (score % 50 === 0 && itemSpeed < 7) itemSpeed += 0.5;
            if (score % 50 === 0 && spawnRate > 30) spawnRate -= 10;
            continue;
        }

        // Missed
        if (item.y > canvas.height) {
            fallingItems.splice(i, 1);
            i--;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Basket
    ctx.fillStyle = '#2b6cb0';
    ctx.beginPath();
    ctx.roundRect(basket.x, basket.y, basket.width, basket.height, 8);
    ctx.fill();

    // Items
    fallingItems.forEach(item => {
        ctx.font = `${item.size}px Arial`;
        ctx.fillText(item.type, item.x, item.y);
    });
}

function gameLoop() {
    if (!isPlaying) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    let users = JSON.parse(localStorage.getItem('gameUsers'));
    
    // Save high score
    if (score > users[currentUser].highScore) {
        users[currentUser].highScore = score;
        localStorage.setItem('gameUsers', JSON.stringify(users));
        document.getElementById('highScore').textContent = score;
    }

    score = 0;
    itemSpeed = 3;
    spawnRate = 80;
    frameCount = 0;
    fallingItems = [];
    basket.x = 250;
    document.getElementById('score').textContent = score;
}