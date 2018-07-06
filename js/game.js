window.addEventListener("scroll", function (e) {
    window.scrollTo(0, 0);
}, false);

<!-- variable size for the canvas -->
var screenWidth = 1200,
    screenHeight = 700;

<!--instantiation of the game with the functions preload,create,update-->
var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update
});

<!--all global variables (not very clean) -->

var playerScore = 0; <!-- player's scoreText value -->
var scoreText; <!--player scoreText text -->
var backButton;<!--menu return button-->

var gameSpeed = 5;
var paused = true;
var play;<!--we launched the game-->

var missileSpeed = 3;
var nbMissiles = 0;
var canLaunchMissile = true;
var missiles = []; <!--array of missiles to instantiate as many as you want-->
var timeoutMissile = 1200; <!--minimum time between each missile launch-->

var asteroidL = [];<!--asteroid array with animation left to instantiate as much as you want-->
var asteroidR = [];<!--asteroid array with animation right to instantiate as much as you want-->
var nbAsteroids = 0;<!-- number of asteroids defined according to the level of difficulty in the menu -->

var ship;
var isShipDestroyed = false;

var explosion;

function preload() {

    <!--preloading all images-->
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    <!-- SHOW_ALL exact_fit-->
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.load.image("background", './images/bsky.png');
    game.load.spritesheet('ship', './images/ship.png', 134, 62, 3);
    game.load.image('montagne', './images/bmontagne.png');
    game.load.image('grass', './images/bgrass.png');
    game.load.spritesheet('asteroid32', './images/asteroid-99-108-32.png', 99, 108, 32);
    game.load.spritesheet('asteroid31', './images/asteroid-102-109-31.png', 102, 109, 31);
    game.load.spritesheet('missile', './images/missile.png', 103, 32, 11);
    game.load.spritesheet('explosion', './images/explosion.png', 128, 128, 15);
    game.load.image('retour', './images/boutonretour.png');
    game.load.image('panel', './images/panel.png');
    game.load.image('boutonvert', './images/boutonvert.png');
    game.load.image('boutonjaune', './images/boutonjaune.png');
    game.load.image('boutonorange', './images/boutonorange.png');
    game.load.spritesheet('arrow', './images/arrowsheet.png', 332, 227, 2);
    game.load.spritesheet('space', './images/spacesheet.png', 332, 95, 7);
    game.load.spritesheet('echap', './images/echapsheet.png', 115, 115, 2);
    game.load.spritesheet('pause', './images/play-pause.png', 200, 200, 2);
}

function create() {

    <!--the physics of the game is phaser arcade physics-->
    game.physics.startSystem(Phaser.Physics.ARCADE);

    <!--all imputs are defined by variables-->
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    <!--adding backgrounds-->
    background = game.add.sprite(0, 0, 'background');
    montagne = game.add.sprite(0, 0, 'montagne');
    grass = game.add.sprite(0, 0, 'grass');

    <!--adding 2 spacecraft at the same positions to have 2 collision zones (only rectangular)-->
    ship = game.add.sprite((screenWidth / 10), (screenHeight / 2 - 50), 'ship');
    ship.frame = 0;
    ship.animations.add('moteur', [0, 1, 2], 10, true);
    ship.animations.play('moteur');

    game.physics.enable(ship, Phaser.Physics.ARCADE);

    ship.body.setSize(60, 30, 20, 10);

    ship2 = game.add.sprite((screenWidth / 10), (screenHeight / 2 - 50), 'ship');
    ship2.frame = 0;
    ship2.animations.add('moteur', [0, 1, 2], 10, true);
    ship2.animations.play('moteur');

    game.physics.enable(ship2, Phaser.Physics.ARCADE);
    ship2.body.setSize(50, 25, 60, 30);


    <!--the 3 explosions outside the screen that we add to the top of the ship if he dies-->
    explosion1 = game.add.sprite((screenWidth), 0, 'explosion');

    explosion1.frame = 0;
    explosion1.animations.add('explose', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 20, true);
    explosion1.animations.play('explose');
    explosion1.scale.setTo(0.60, 0.60);

    explosion2 = game.add.sprite((screenWidth), 0, 'explosion');

    explosion2.frame = 3;
    explosion2.animations.add('explose', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 10, true);
    explosion2.animations.play('explose');
    explosion2.scale.setTo(0.60, 0.60);

    explosion3 = game.add.sprite((screenWidth), 0, 'explosion');

    explosion3.frame = 14;
    explosion3.animations.add('explose', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 15, true);
    explosion3.animations.play('explose');
    explosion3.scale.setTo(0.60, 0.60);


    <!--we allow shooting all timemissile-->
    game.time.events.loop(timeoutMissile, setMissile, this);

    <!--the missile group / class is created and added to physics for collisions-->
    missiles = game.add.group();
    missiles.enableBody = true;
    missiles.physicsBodyType = Phaser.Physics.ARCADE;

    <!--if a key is released we look at which one and either we pause or create a missile-->
    game.input.keyboard.onUpCallback = function (e) {

        if (e.keyCode == 27 && panel.visible == false) {
            paused = !paused;
        }

        if (e.keyCode == 32 && !isShipDestroyed && !paused) {

            if (canLaunchMissile) {


                missiles[nbMissiles] = missiles.create(0, 0, 'missile');
                missiles[nbMissiles].frame = 0;
                missiles[nbMissiles].x = (ship.x + ship.width * 0.55);
                missiles[nbMissiles].y = (ship.y + ship.height * 0.4);
                missiles[nbMissiles].animations.add('tourne', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10, true);
                missiles[nbMissiles].animations.play('tourne');
                missiles[nbMissiles].scale.setTo(0.45, 0.45);
                nbMissiles++;
                canLaunchMissile = false;
            }
        }


    };


    <!--single explosion that we will move to the location of the collision of a missile and an asteroid-->
    explosion = game.add.sprite((screenWidth), 0, 'explosion');
    explosion.frame = 0;
    explosion.animations.add('explose', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 20, false);
    explosion.animations.play('explose');
    explosion.scale.setTo(0.45, 0.45);

    <!-- creative function of the game start menu -->
    menu();
}


function menu() {

    panel = game.add.sprite((screenWidth / 2 - 400), 50, 'panel');
    var style2 = {
        font: "45px Impact",
        fill: "#ffffff"
    };
    var style3 = {
        font: "30px Impact",
        fill: "#ffffff"
    };
    var style4 = {
        font: "18px Arial",
        fill: "#ffffff"
    };
    var style5 = {
        font: "18px Arial",
        fill: "#ffffff"
    };

    <!--space attack / game title-->
    title = game.add.text((screenWidth / 2 - 140), 80, "Space Attack", style2);
    title.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);

    <!--menu back button-->
    backButton = game.add.button((screenWidth / 2 - 300), 80, 'retour', retourner, this, 2, 1, 0);
    backButton.scale.setTo(0.60, 0.60);
    backButtonText = game.add.text((screenWidth / 2 - 285), 83, "Retour ", style5);

    <!--three difficulty buttons-->
    playEasy = game.add.button((screenWidth / 2 - 330), 150, 'boutonvert', playEasy, this, 2, 1, 0);

    playMedium = game.add.button((screenWidth / 2 - 95), 150, 'boutonjaune', playmMedium, this, 2, 1, 0);

    playHard = game.add.button((screenWidth / 2 + 140), 150, 'boutonorange', playHard, this, 2, 1, 0);


    <!--three texts of difficulty buttons-->
    easy = game.add.text((screenWidth / 2 - 265), 155, "Easy ", style3);
    easy.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    medium = game.add.text((screenWidth / 2 - 50), 155, "Medium ", style3);
    medium.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    hard = game.add.text((screenWidth / 2 + 200), 155, "Hard ", style3);
    hard.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);

    <!--description text of the purpose of the game-->
    description = game.add.text((screenWidth / 2 - 320), 250, "Le but du jeu est d'obtenir le meilleur scoreText en détruisant le plus d'asteroids", style4);
    description2 = game.add.text((screenWidth / 2 - 320), 275, "Il y en a une infinité et si ils vous touchent vous perdez", style4);


    <!--the animated keys of the menu-->
    arrow = game.add.sprite((screenWidth / 2 - 325), 330, 'arrow');
    arrow.frame = 0;
    arrow.scale.setTo(0.4, 0.4);
    arrow.animations.add('move', [0, 1], 1, true);
    arrow.animations.play('move');

    space = game.add.sprite((screenWidth / 2 - 325), 450, 'space');
    space.frame = 0;
    space.scale.setTo(0.4, 0.4);
    space.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6], 6, true);
    space.animations.play('move');

    echap = game.add.sprite((screenWidth / 2 - 300), 520, 'echap');
    echap.frame = 0;
    echap.scale.setTo(0.5, 0.5);
    echap.animations.add('move', [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1], 15, true);
    echap.animations.play('move');

    <!--ship and missile of the demonstration of the keys-->
    shipspace = game.add.sprite((screenWidth / 2 - 180), 450, 'ship');
    shipspace.frame = 0;
    shipspace.animations.add('moteur', [0, 1, 2], 10, true);
    shipspace.animations.play('moteur');
    shipspace.scale.setTo(0.70, 0.70);

    shiparrow = game.add.sprite((screenWidth / 2 - 180), 350, 'ship');
    shiparrow.frame = 0;
    shiparrow.animations.add('moteur', [0, 1, 2], 10, true);
    shiparrow.animations.play('moteur');
    shiparrow.scale.setTo(0.70, 0.70);

    missileMenu = game.add.sprite(0, 0, 'missile');
    missileMenu.frame = 0;
    missileMenu.x = (shipspace.x + 3 + shipspace.width / 2)
    missileMenu.y = (shipspace.y + shipspace.height / 2 - 9);
    missileMenu.animations.add('tourne', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10, true);
    missileMenu.animations.play('tourne');
    missileMenu.scale.setTo(0.30, 0.30);

    <!--explosion that make pauses-->
    explosion4 = game.add.sprite((screenWidth / 2 - 230), 520, 'explosion');
    explosion4.frame = 14;
    explosion4.animations.add('explose', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 15, true);
    explosion4.animations.play('explose');
    explosion4.scale.setTo(0.60, 0.60);

    <!--pause icon-->
    pause = game.add.sprite((screenWidth / 2 - 208), 545, 'pause');
    pause.frame = 0;
    pause.scale.setTo(0.15, 0.15);
    pause.animations.add('move', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 15, true);
    pause.animations.play('move');
}

<!--function of the difficulty buttons to set the number and create the asteroids-->
function playEasy() {


    nbAsteroids = 6;
    createAsteroid();
    playgame();
    creerUI();
}

function playmMedium() {


    nbAsteroids = 10;
    createAsteroid();
    playgame();
    creerUI();
}

function playHard() {


    nbAsteroids = 12;
    createAsteroid();
    playgame();
    creerUI();
}

<!--function to create asteroids-->
function createAsteroid() {

    var trente2zero = [];
    var trente1zero = [];

    for (var i = 0; i < 31; i++) {
        trente2zero[i] = 31 - i;
    }

    for (var i = 0; i < 31; i++) {
        trente1zero[i] = 30 - i;
    }

    asteroid = game.add.group();
    asteroid.enableBody = true;
    asteroid.physicsBodyType = Phaser.Physics.ARCADE;


    for (var i = 0; i < nbAsteroids; i++) {

        asteroidR[i] = asteroid.create(game.rnd.realInRange((screenWidth), (screenWidth * 1.2)), game.rnd.realInRange(0, (screenHeight * 0.85)), 'asteroid31');
        asteroidR[i].frame = 0;

        if (i % 2 == 0) {
            asteroidR[i].animations.add('tourne', trente1zero);
        } else {
            asteroidR[i].animations.add('tourne', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
        }


        asteroidR[i].animations.play('tourne', 20, true);
        asteroidR[i].scale.setTo(0.45, 0.45);

        asteroidL[i] = asteroid.create(game.rnd.realInRange((screenWidth), (screenWidth * 1.2)), game.rnd.realInRange(0, (screenHeight * 0.85)), 'asteroid32');
        asteroidL[i].frame = 0;
        if (i % 2 == 0) {
            asteroidL[i].animations.add('tourne', trente2zero);
        } else {
            asteroidL[i].animations.add('tourne', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
        }

        asteroidL[i].animations.play('tourne', 20, true);
        asteroidL[i].scale.setTo(0.45, 0.45);

    }

}

function creerUI() {

    <!--var css-->
    var style = {
        font: "20px Arial",
        fill: "#ffffff"
    };

    <!--var css-->
    var styleretourjeu = {
        font: "18px Arial",
        fill: "#ffffff"
    };

    <!--game backbutton-->
    var retour = game.add.button(3, 3, 'retour', retourner, this, 2, 1, 0);
    retour.scale.setTo(0.60, 0.60);
    retourtextjeu = game.add.text(17, 6, "Retour", styleretourjeu);

    <!--scoreText on screen-->
    scoreText = game.add.text(90, 3, "Score " + playerScore, style);

}

<!--hide all menu (can't make container invisible) ... ugly -->
function playgame() {
    paused = !paused;
    panel.visible = false;
    title.visible = false;
    easy.visible = false;
    medium.visible = false;
    hard.visible = false;
    playHard.visible = false;
    playEasy.visible = false;
    playMedium.visible = false;
    backButton.visible = false;
    description.visible = false;
    description2.visible = false;
    space.visible = false;
    arrow.visible = false;
    echap.visible = false;
    missileMenu.kill();
    shiparrow.kill();
    shipspace.kill();
    explosion4.kill();
    pause.visible = false;
    backButtonText.visible = false;
}

<!--function  pause-->
function pause() {
    paused = !paused;
}

<!--return to my website-->
function retourner() {

    location.href = "https://grachet.fr";
}

<!--authorize to launch missile-->
function setMissile() {
    canLaunchMissile = true;
}

<!--main function to loop the game -->
function update() {


    <!--move the ships and missiles from the menu while the game is paused-->
    if (arrow.frame == 1) {
        shiparrow.x--;
    }
    if (arrow.frame == 0) {
        shiparrow.x++;
    }
    if (space.frame == 0) {
        missileMenu.x = (shipspace.x + 3 + shipspace.width / 2)
    }
    missileMenu.x++;


    <!--loop of the game if he is not on break-->
    if (!paused) {


        scoreText.text = "Score " + playerScore;


        for (var i = 0; i < nbAsteroids; i++) {
            asteroidL[i].x = asteroidL[i].x + (-1 - 2 * i / nbAsteroids);
            asteroidR[i].x = asteroidR[i].x + (-1 - 2 * i / nbAsteroids);
        }

        for (var i = 0; i < nbAsteroids; i++) {


            if (asteroidL[i].x < -asteroidL[i].width) {
                asteroidL[i].y = game.rnd.realInRange(0, (screenHeight - 128 * 0.45));
                asteroidL[i].x = screenWidth;

            }

            if (asteroidR[i].x < -asteroidR[i].width) {
                asteroidR[i].y = game.rnd.realInRange(0, (screenHeight - 128 * 0.45));
                asteroidR[i].x = screenWidth;
            }
        }

        for (var i = 0; i < nbMissiles; i++) {

            missiles[i].x = missiles[i].x + missileSpeed;


            if (missiles[i].x >= (screenWidth)) {


                missiles[i].destroy();

            }

        }

        <!--check for collisions-->
        game.physics.arcade.overlap(asteroid, missiles, collisionmissile, null, this);
        game.physics.arcade.overlap(ship, asteroid, collisionship, null, this);
        game.physics.arcade.overlap(ship2, asteroid, collisionship, null, this);


        <!--move the green background (planet)-->
        if (montagne.x > -2400) {
            montagne.x--;
        } else {
            montagne.x = 0
        }
        if (grass.x > -2400) {
            grass.x--;
            grass.x--;
        } else {
            grass.x = 0
        }


        <!--if the ship is not dead, we can move it-->
        if (!isShipDestroyed) {
            if (upKey.isDown) {
                if (ship.y > 3) {
                    ship.y = ship.y - gameSpeed;
                    ship2.y = ship2.y - gameSpeed;
                }
            } else if (downKey.isDown) {
                if (ship.y < (screenHeight - 100)) {
                    ship.y = ship.y + gameSpeed;
                    ship2.y = ship2.y + gameSpeed;
                }
            }

            if (leftKey.isDown) {
                if (ship.x > 10) {
                    ship.x = ship.x - gameSpeed;
                    ship2.x = ship2.x - gameSpeed;
                }
            } else if (rightKey.isDown) {
                if (ship.x < (screenWidth - ship.width)) {
                    ship.x = ship.x + gameSpeed;
                    ship2.x = ship2.x + gameSpeed;
                }
            }
        }


    }

    <!-- if a missile collides with an asteroid, we go out -->

    <!--the asteroid of the screen destroys the missile and puts the explosion on impact-->
    function collisionmissile(asteroid, missile) {

        playerScore++;
        explosion.setFrame(0);
        explosion.animations.play('explose');
        explosion.x = (asteroid.x);
        explosion.y = (asteroid.y);


        missile.kill();

        asteroid.y = screenWidth;
    }

    <!--if the ship collides with an asteroid, we put the explosions on the ship-->
    function collisionship(ship, asteroid) {

        isShipDestroyed = true;

        explosion1.x = ship.x - 5;
        explosion1.y = ship.y - 5;

        explosion2.x = ship.x + 40;
        explosion2.y = ship.y;

        explosion3.x = ship.x + 80;
        explosion3.y = ship.y + 10;


        <!--reload the page after 3 sec-->
        game.time.events.add(Phaser.Timer.SECOND * 3, restart, this);


    }
}

<!--we pause the game to avoid the bugs and reload the page-->
function restart() {
    game.paused = true;
    location.reload();

}
