let lanes = [150, 300, 450];
let playerPos;
let obstacles = [];
let song;
let backgroundSound;
let winSound;
let loseSound;
let fft;
let laneIndex = 1;
let score = 0;
let gamePaused = false;
let gameOver = false;
let startScreen = true;
let levelSelectScreen = false;
let endScreen = false;
let winScreen = false;
let mic;
let minMicLevel = 0.01;
let gameTime = 0;
let showPopup = false;
let musicPlaying = false;
let backgroundImg;
let obstacleTimer = 0;
let obstacleInterval = 1000; // 1 segundo
let gameTimer = 204000; //204000 - 2000;
let lastKeyPressTime = 0;
let keyPressDelay = 150; // 130ms de atraso entre teclas
let accumulatedScore = 0;
let selectedLevel = 0;
let levelImages = [];
let topScores = [];
let playerImg;
let obstacleImg;

function preload() {
  song = loadSound('media/musica.mp3');
  backgroundSound = loadSound('media/background.mp3');
  winSound = loadSound('media/win.mp3');
  loseSound = loadSound('media/lose.mp3');
  backgroundImg = loadImage('media/background.png');
  playerImg = loadImage('media/player.png');
  obstacleImg = loadImage('media/obstacle.png');
  for (let i = 0; i < 6; i++) {
    levelImages[i] = loadImage(`media/level${i+1}.jpg`);
  }
}

function setup() {
  createCanvas(600, 600);
  playerPos = createVector(lanes[laneIndex], height - 100);
  fft = new p5.FFT();
  mic = new p5.AudioIn();
  mic.start();
  backgroundSound.loop();
}

function draw() {
  if (startScreen) {
    startGameScreen();
  } else if (levelSelectScreen) {
    showLevelSelectScreen();
  } else if (endScreen) {
    endGameScreen();
  } else if (winScreen) {
    winGameScreen();
  } else {
    if (!gamePaused) {
      playGame();
    }
    if (showPopup) {
      pausePopup();
    }
  }
}

function startGameScreen() {
  background(0);
  tint(255, 39);
  image(backgroundImg, 0, 0, width, height);
  noTint();

  fill(255);
  textAlign(CENTER);
  
  textSize(40);
  textStyle(BOLD);
  text("BEM-VINDO AO ", width / 2 + 6, height / 4);
  text("IPVC Audio Surf!", width / 2, height / 3);

  textSize(20);
  text("REGRAS: ", width / 2, height / 2);
  text("Use as setas esquerda/direita para mudar de faixa.", width / 2, height / 2 + 60);
  text("Canta com a música para ativar obstáculos", width / 2, height / 2 + 100);
  text("e ganhar Pontos!", width / 2, height / 2 + 125);
  text("Prima ENTER para começar", width / 2, height / 2 + 215);
  textStyle(NORMAL);
  
  if (keyIsPressed && key === 'Enter' && millis() - lastKeyPressTime > keyPressDelay) {
    startScreen = false;
    levelSelectScreen = true;
    lastKeyPressTime = millis();
  }
}

function showLevelSelectScreen() {
  background(0);
  tint(255, 128);
  image(backgroundImg, 0, 0, width, height);
  noTint();

  fill(255);
  textAlign(CENTER);
  textSize(30);
  text("Escolha o seu nível", width / 2, 50);
  textSize(15);
  text("ENTER para confirmar", width / 2, height -50);

  for (let i = 0; i < 6; i++) {
    let row = floor(i / 3);
    let col = i % 3;
    image(levelImages[i], 100 + col * 150, 150 + row * 150, 100, 100);
    if (i === selectedLevel) {
      noFill();
      stroke(0);
      strokeWeight(1.5);
      rect(95 + col * 150, 145 + row * 150, 110, 110);
      
      // Desenhar seta
      fill(255);
      triangle(150 + col * 150, 270 + row * 150, 130 + col * 150, 290 + row * 150, 170 + col * 150, 290 + row * 150);
    }
  }

  if (keyIsPressed && millis() - lastKeyPressTime > keyPressDelay) {
    if (keyCode === LEFT_ARROW && selectedLevel % 3 > 0) {
      selectedLevel--;
    } else if (keyCode === RIGHT_ARROW && selectedLevel % 3 < 2) {
      selectedLevel++;
    } else if (keyCode === UP_ARROW && selectedLevel > 2) {
      selectedLevel -= 3;
    } else if (keyCode === DOWN_ARROW && selectedLevel < 3) {
      selectedLevel += 3;
    } else if (key === 'Enter') {
      levelSelectScreen = false;
      resetGame();
      backgroundSound.stop();
      song.play();
      musicPlaying = true;
    }
    lastKeyPressTime = millis();
  }
}

function endGameScreen() {
  background(0);
  tint(255, 39);
  image(backgroundImg, 0, 0, width, height);
  noTint();

  fill(255, 0, 0);
  textAlign(CENTER);
  
  textSize(40);
  text("Game Over!", width / 2, height / 3);
  
  textSize(20);
  text("Pontuação Final: " + score, width / 2, height / 2);
  
  // Mostrar pontuações mais altas
  text("Top Pontuações:", width / 2, height / 2 + 40);
  for (let i = 0; i < Math.min(topScores.length, 3); i++) {
    text((i + 1) + ". " + topScores[i], width / 2, height / 2 + 70 + i * 30);
  }
  
  text("Prima ENTER para voltar ao início", width / 2, height - 50);

  if (keyIsPressed && key === 'Enter' && millis() - lastKeyPressTime > keyPressDelay) {
    startScreen = true;
    endScreen = false;
    backgroundSound.loop();
    lastKeyPressTime = millis();
  }
}

function winGameScreen() {
  background(0);
  tint(255, 39);
  image(backgroundImg, 0, 0, width, height);
  noTint();

  fill(0, 255, 0);
  textAlign(CENTER);
  
  textSize(40);
  text("Ganhou!", width / 2, height / 3);
  
  textSize(20);
  text("Pontuação Final: " + score, width / 2, height / 2);
  
  // Mostrar pontuações mais altas
  text("Top Pontuações:", width / 2, height / 2 + 40);
  for (let i = 0; i < Math.min(topScores.length, 3); i++) {
    text((i + 1) + ". " + topScores[i], width / 2, height / 2 + 70 + i * 30);
  }
  
  text("Prima ENTER para voltar ao início", width / 2, height - 50);

  if (keyIsPressed && key === 'Enter' && millis() - lastKeyPressTime > keyPressDelay) {
    startScreen = true;
    winScreen = false;
    backgroundSound.loop();
    lastKeyPressTime = millis();
  }
}

function playGame() {
  // Desenhar fundo
  image(backgroundImg, 0, 0, width, height);
  image(backgroundImg, 0, -height, width, height);
  
  // Mais do fundo
  backgroundImg.y = (backgroundImg.y + 5) % height;
  
  let micLevel = mic.getLevel();
  
  gameTime += deltaTime;
  
  if (gameTime >= gameTimer) {
    winScreen = true;
    song.stop();
    winSound.play();
    updateTopScores(score);
    return;
  }
  
  if (micLevel > minMicLevel) {
    obstacleTimer += deltaTime;
    accumulatedScore += deltaTime / 1000;
    score = floor(accumulatedScore);
    
    if (obstacleTimer >= obstacleInterval) {
      for (let i = 0; i < 3; i++) {
        let lane = floor(random(3));
        let obstacle = createVector(lanes[lane], -50 - i * 100);
        obstacles.push(obstacle);
      }
      obstacleTimer = 0;
    }
  }
  
  // Desenhar jogador
  fill(0, 255, 0);
  rect(playerPos.x - 25, playerPos.y - 25, 50, 50);
  image(playerImg, playerPos.x - 20, playerPos.y - 20, 40, 40);
  
  for (let i = obstacles.length - 1; i >= 0; i--) {
    // Desenhar obstáculo
    fill(255, 0, 0, 0);
    noStroke();
    rect(obstacles[i].x - 25, obstacles[i].y - 25, 50, 70);
    image(obstacleImg, obstacles[i].x - 30, obstacles[i].y - 40, 60, 80);
    obstacles[i].y += 5;

    if (checkCollision(playerPos, obstacles[i])) {
      obstacles.splice(i, 1);
      endScreen = true;
      song.stop();
      loseSound.play();
      updateTopScores(score);
      return;
    }
    
    if (obstacles[i].y > height) {
      obstacles.splice(i, 1);
    }
  }
  stroke(0);
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("Pontuação: " + score, 35, 30);
  textAlign(RIGHT);
  text("Tempo: " + floor((gameTimer - gameTime) / 1000) + "s", width - 30, 30);
  
  // Informação do autor
  textAlign(RIGHT);
  textSize(12);
  fill(200);
  text("ESC para Menu de Pausa", width/4 + 21, height - 10);
  text("António Rebelo - Nº28837 - ECGM", width - 30, height - 10);
  
  handlePlayerMovement();
}

function handlePlayerMovement() {
  if (keyIsPressed && millis() - lastKeyPressTime > keyPressDelay) {
    if (keyCode === LEFT_ARROW && laneIndex > 0) {
      laneIndex--;
      lastKeyPressTime = millis();
    } else if (keyCode === RIGHT_ARROW && laneIndex < 2) {
      laneIndex++;
      lastKeyPressTime = millis();
    }
  }
  
  let targetX = lanes[laneIndex];
  playerPos.x = lerp(playerPos.x, targetX, 0.2);
}

function checkCollision(player, obstacle) {
  return (
    player.x - 25 < obstacle.x + 25 &&
    player.x + 25 > obstacle.x - 25 &&
    player.y - 25 < obstacle.y + 25 &&
    player.y + 25 > obstacle.y - 25
  );
}

function pausePopup() {
  fill(50, 50, 50, 200);
  rect(width / 4, height / 3, width / 2, height / 3);
  
  fill(255);

  textAlign(CENTER);
  textSize(20);
  text("Jogo Pausado", width / 2, height / 2 - 50);
  text("Pressione:", width / 2, height / 2 - 5 );
  text("- P para continuar", width / 2 - 5, height / 2 + 30);
  text("- S para sair", width / 2 - 5, height / 2 + 55);
  
  if (keyIsPressed && millis() - lastKeyPressTime > keyPressDelay) {
    if (key === 'p') {
      gamePaused = false;
      showPopup = false;
      song.play();
      lastKeyPressTime = millis();
    } else if (key === 's') {
      startScreen = true;
      gamePaused = false;
      showPopup = false;
      song.stop();
      backgroundSound.loop();
      lastKeyPressTime = millis();
    }
  }
}

function resetGame() {
  song.stop();
  score = 0;
  accumulatedScore = 0;
  gameTime = 0;
  laneIndex = 1;
  obstacles = [];
  endScreen = false;
  winScreen = false;
  gameOver = false;
  showPopup = false;
  gamePaused = false;
  playerPos.x = lanes[laneIndex];
  obstacleTimer = 0;
}

function keyPressed() {
  if (keyCode === ESCAPE && !startScreen && !levelSelectScreen && !endScreen && !winScreen) {
    gamePaused = !gamePaused;
    showPopup = !showPopup;
    if (gamePaused) {
      song.pause();
    } else {
      song.play();
    }
  }
}

function updateTopScores(newScore) {
  topScores.push(newScore);
  topScores.sort((a, b) => b - a);
  topScores = topScores.slice(0, 3);
}