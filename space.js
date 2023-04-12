//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//pozzo
let pozzoWidth = tileSize*1.5;
let pozzoHeight = tileSize*1.5;
let pozzoX = tileSize * columns/2 - tileSize;
let pozzoY = tileSize * rows - tileSize*2;

let pozzo = {
    x : pozzoX,
    y : pozzoY,
    width : pozzoWidth,
    height : pozzoHeight
}

let pozzoImg;
let pozzoVelocityX = tileSize; //pozzo moving speed

//coaches
let coachArray = [];
let coachWidth = tileSize*2;
let coachHeight = tileSize*2;
let coachX = tileSize;
let coachY = tileSize;
let coachImg;

let coachRows = 2;
let coachColumns = 3;
let coachCount = 0; //number of coachs to defeat
let coachVelocityX = 2; //coach moving speed

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

    //draw initial pozzo
    // context.fillStyle="green";
    // context.fillRect(pozzo.x, pozzo.y, pozzo.width, pozzo.height);

    //load images
    pozzoImg = new Image();
    pozzoImg.src = "./images/pozzo.png";
    pozzoImg.onload = function() {
        context.drawImage(pozzoImg, pozzo.x, pozzo.y, pozzo.width, pozzo.height);
    }

    let coachImgPaths = [
      "/images/xisco.png",
      "/images/ranieri.png",
      "/images/wilder.png",
      "/images/edwards.png",
      "/images/bilic.png",
  ];

  coachImg = new Image();
  coachImg.src = coachImgPaths[Math.floor(Math.random() * coachImgPaths.length)]; // randomly select a src path
  createcoachs();

    requestAnimationFrame(update);
    document.addEventListener("keydown", movepozzo);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //pozzo
    context.drawImage(pozzoImg, pozzo.x, pozzo.y, pozzo.width, pozzo.height);

    //coach
    for (let i = 0; i < coachArray.length; i++) {
        let coach = coachArray[i];
        if (coach.alive) {
            coach.x += coachVelocityX;

            //if coach touches the borders
            if (coach.x + coach.width >= board.width || coach.x <= 0) {
                coachVelocityX *= -1;
                coach.x += coachVelocityX*2;

                //move all coachs up by one row
                for (let j = 0; j < coachArray.length; j++) {
                    coachArray[j].y += coachHeight;
                }
            }
            context.drawImage(coachImg, coach.x, coach.y, coach.width, coach.height);

            if (coach.y >= pozzo.y) {
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

        //bullet collision with coachs
        for (let j = 0; j < coachArray.length; j++) {
            let coach = coachArray[j];
            if (!bullet.used && coach.alive && detectCollision(bullet, coach)) {
                bullet.used = true;
                coach.alive = false;
                coachCount--;
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    //next level
    if (coachCount == 0) {
        //increase the number of coachs in columns and rows by 1
        score += coachColumns * coachRows * 100; //bonus points :)
        coachColumns = Math.min(coachColumns + 1, columns/2 -2); //cap at 16/2 -2 = 6
        coachRows = Math.min(coachRows + 1, rows-4);  //cap at 16-4 = 12
        if (coachVelocityX > 0) {
            coachVelocityX += 0.2; //increase the coach movement speed towards the right
        }
        else {
            coachVelocityX -= 0.2; //increase the coach movement speed towards the left
        }
        coachArray = [];
        bulletArray = [];
        createcoachs();
    }

    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score, 5, 20);
}

function movepozzo(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && pozzo.x - pozzoVelocityX >= 0) {
        pozzo.x -= pozzoVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && pozzo.x + pozzoVelocityX + pozzo.width <= board.width) {
        pozzo.x += pozzoVelocityX; //move right one tile
    }
}

function createcoachs() {
    for (let c = 0; c < coachColumns; c++) {
        for (let r = 0; r < coachRows; r++) {
            let coach = {
                img : coachImg,
                x : coachX + c*coachWidth,
                y : coachY + r*coachHeight,
                width : coachWidth,
                height : coachHeight,
                alive : true
            }
            coachArray.push(coach);
        }
    }
    coachCount = coachArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        //shoot
        let bullet = {
            x : pozzo.x + pozzoWidth*15/32,
            y : pozzo.y,
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
