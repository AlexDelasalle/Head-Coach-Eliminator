//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//jet
let jetWidth = tileSize*1.5;
let jetHeight = tileSize*1.5;
let jetX = tileSize * columns/2 - tileSize;
let jetY = tileSize * rows - tileSize*2.5;

let jet = {
    x : jetX,
    y : jetY,
    width : jetWidth,
    height : jetHeight
}

let jetImg;
let jetVelocityX = tileSize; //jet moving speed

//aliens
let alienArray = [];
let alienWidth = tileSize*1.5;
let alienHeight = tileSize*1.5;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 2; //alien moving speed

//bullets
let bulletArray = [];
let bulletVelocityY = -10; //bullet moving speed

let score = 0;
let gameOver = false;


window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial jet
    // context.fillStyle="green";
    // context.fillRect(jet.x, jet.y, jet.width, jet.height);

    //load images
    jetImg = new Image();
    jetImg.src = "./images/jet.png";
    jetImg.onload = function() {
        context.drawImage(jetImg, jet.x, jet.y, jet.width, jet.height);
    }

  alienImg = new Image();
  alienImg.src = "./images/alien.png"
  createaliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", movejet);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //jet
    context.drawImage(jetImg, jet.x, jet.y, jet.width, jet.height);

    //alien
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //if alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;

                //move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= jet.y) {
                gameOver = true;
            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    //next level
    if (alienCount == 0) {
        //increase the number of aliens in columns and rows by 1
        score += alienColumns * alienRows * 100; //bonus points :)
        alienColumns = Math.min(alienColumns + 1, columns/2 -2); //cap at 16/2 -2 = 6
        alienRows = Math.min(alienRows + 1, rows-4);  //cap at 16-4 = 12
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2; //increase the alien movement speed towards the right
        }
        else {
            alienVelocityX -= 0.2; //increase the alien movement speed towards the left
        }
        alienArray = [];
        bulletArray = [];
        createaliens();
    }

    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score, 5, 20);
}

function movejet(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && jet.x - jetVelocityX >= 0) {
        jet.x -= jetVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && jet.x + jetVelocityX + jet.width <= board.width) {
        jet.x += jetVelocityX; //move right one tile
    }
}

function createaliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        //shoot
        let bullet = {
            x : jet.x + jetWidth*15/32,
            y : jet.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
