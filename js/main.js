/* Character */
function Character(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'characterImage')
    this.anchor.set(0.5, 0.5) //人物中心點
    this.game.physics.enable(this) //啟用移動物理性質
    this.body.collideWorldBounds = true //避免人物超出螢幕
    this.animations.add('stop', [0])
    this.animations.add('run', [1, 2], 8, true) // 8fps looped
    this.animations.add('jump', [3])
    this.animations.add('fall', [4])
    this.animations.add('die', [5, 6, 5, 6, 5, 6, 5, 6], 12)
}
Character.prototype = Object.create(Phaser.Sprite.prototype)
Character.prototype.constructor = Character
Character.prototype.move = function (direction) {
    if (this.isFrozen) { return } // 正過關進門
    const SPEED = 200
    this.body.velocity.x = direction * SPEED
    if (this.body.velocity.x < 0) {
        this.scale.x = -1
    } else if (this.body.velocity.x > 0) {
        this.scale.x = 1
    }
}
Character.prototype.jump = function () {
    const JUMP_SPEED = 500
    let canJump = this.body.touching.down && !this.isFrozen && this.alive // 是否踩著地板
    if (canJump || this.isBoosting) {
        this.body.velocity.y = -JUMP_SPEED
        this.isBoosting = true
    }
    return canJump
}
Character.prototype.stopJumpBoosting = function () {
    this.isBoosting = false
}
Character.prototype.die = function () {
    this.alive = false
    this.body.enable = false

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill()
    }, this)
}
Character.prototype.bounce = function () { // 踩死怪後往上回彈一小段
    const BOUNCE_SPEED = 200
    this.body.velocity.y = -BOUNCE_SPEED
}
Character.prototype.update = function () {
    let animationName = this._getAnimationName()
    if (animationName !== this.animations.name) {
        this.animations.play(animationName)
    }
}
Character.prototype.freeze = function () {
    this.body.enable = false
    this.isFrozen = true
}
Character.prototype._getAnimationName = function () {
    let name = 'stop' //預設
    if (!this.alive) {
        name = 'die'
    } else if (this.isFrozen) {
        name = 'stop'
    } else if (this.body.velocity.y < 0) {
        name = 'jump'
    } else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall'
    } else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run'
    }
    return name
}
/* Spider */
function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider')
    this.anchor.set(0.5)//中心
    /* 動畫 */
    this.animations.add('crawl', [0, 1, 2], 8, true) //爬行
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12) //死亡
    this.animations.play('crawl')
    /* 屬性 */
    this.game.physics.enable(this) //啟用移動物理性質
    this.body.collideWorldBounds = true //避免超出螢幕
    this.body.velocity.x = Spider.SPEED
}
Spider.SPEED = 200
Spider.prototype = Object.create(Phaser.Sprite.prototype)
Spider.prototype.constructor = Spider
Spider.prototype.update = function () {
    if (this.body.touching.right || this.body.blocked.right) { //偵測角色是否碰觸(右邊)
        this.body.velocity.x = -Spider.SPEED //轉向左邊
    } else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED //轉向右邊
    }
}
Spider.prototype.die = function () {
    this.body.enable = false
    this.animations.play('die').onComplete.addOnce(function () {
        this.kill()
    }, this)
}

const LEVEL_COUNT = 3
Playstate = {}
Playstate.preload = function () {
    /* platforms */
    this.game.load.json("level:0", './data/level00.json')
    this.game.load.json("level:1", './data/level01.json')
    this.game.load.json("level:2", './data/level02.json')
    this.game.load.image('background', './images/background.png')
    this.game.load.image('ground', './images/ground.png')
    this.game.load.image('grass:8x1', './images/grass_8x1.png')
    this.game.load.image('grass:6x1', './images/grass_6x1.png')
    this.game.load.image('grass:4x1', './images/grass_4x1.png')
    this.game.load.image('grass:2x1', './images/grass_2x1.png')
    this.game.load.image('grass:1x1', './images/grass_1x1.png')
    /* character */
    this.game.load.spritesheet('characterImage', './images/hero.png', 32, 42)
    /* Sound effect */
    this.game.load.audio('sfx:jump', './audio/jump.wav')
    this.game.load.audio('sfx:coin', './audio/coin.wav')
    this.game.load.audio('sfx:stomp', './audio/stomp.wav')
    this.game.load.audio('sfx:key', './audio/key.wav')
    this.game.load.audio('sfx:door', './audio/door.wav')
    this.game.load.audio('sfx:background', ['./audio/bgm.mp3', './audio/bgm.ogg'])
    /* gameover popup */
    this.game.load.image('popup:title', './images/Popup/title.png')
    this.game.load.image('popup:text', './images/Popup/text.png')
    this.game.load.image('popup:restart', './images/Popup/btn_restart.png')
    this.game.load.image('popup:link', './images/Popup/btn_link.png')
    this.game.load.image('popup:coin', './images/Popup/final_coin.png')
    /* other */
    this.game.load.spritesheet('coin', './images/coin_animated.png', 35.25, 33)
    this.game.load.spritesheet('spider', './images/spider.png', 36.2, 37)
    this.game.load.spritesheet('door', './images/door.png', 42, 66)
    this.game.load.spritesheet('icon:key', './images/key_icon.png', 19.5, 28)
    this.game.load.image('invisible-wall', './images/invisible_wall.png')
    this.game.load.image('icon:coin', './images/coin_icon.png')
    this.game.load.image('font:numbers', './images/numbers.png')
    this.game.load.image('key', './images/key.png')
    this.game.load.image('logo', './images/logo.png')
}
Playstate.create = function () {
    this.camera.flash("#000000")
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        stomp: this.game.add.audio('sfx:stomp'),
        key: this.game.add.audio('sfx:key'),
        door: this.game.add.audio('sfx:door'),
    }
    this.bgm = this.game.add.audio("sfx:background")
    // this.bgm.play()
    this.bgm.loopFull()
    this.game.add.image(0, 0, 'background')
    this._loadLevel(this.game.cache.getJSON('level:' + this.level))
    this._createHud()
}
Playstate.update = function () {
    this._handleCollisions()
    this._handleInput()
    this.coinFont.text = 'x' + this.coinPickupCount
    this.keyIcon.frame = this.hasKey ? 1 : 0
}
Playstate.shutdown = function () {
    this.bgm.stop()
}
Playstate._loadLevel = function (data) {
    const GRAVITY = 1200 //重力
    this.platforms = this.game.add.group()
    this.coins = this.game.add.group()
    this.spiders = this.game.add.group()
    this.bgDecoration = this.game.add.group()
    this.monsterWalls = this.game.add.group()
    this.monsterWalls.visible = false //隱藏牆壁
    data.platforms.forEach(this._createPlatform, this)
    data.coins.forEach(this._createCoin, this)
    this._createCharacters({ character: data.character, spiders: data.spiders })
    this._createDoor(data.door.x, data.door.y)
    this._createKey(data.key.x, data.key.y)
    this.game.physics.arcade.gravity.y = GRAVITY //增加重力(也可將重力寫在json中 就可有每關不同重力效果)
}
Playstate._createPlatform = function (platform) {
    let sprite = this.platforms.create(platform.x, platform.y, platform.image)
    this.game.physics.enable(sprite)
    sprite.body.allowGravity = false // 不受重力影響
    sprite.body.immovable = true // 地板不能移動
    this._createMonsterWall(platform.x, platform.y, 'left')
    this._createMonsterWall(platform.x + sprite.width, platform.y, 'right')
}
Playstate._createCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin')
    sprite.anchor.set(0.5, 0.5)
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true) // 6fps looped
    sprite.animations.play('rotate')
    this.game.physics.enable(sprite)
    sprite.body.allowGravity = false // 不受重力影響
}
Playstate._createCharacters = function (data) {
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y)
        this.spiders.add(sprite)
    }, this)
    this.character = new Character(this.game, data.character.x, data.character.y)
    this.game.add.existing(this.character)
}
Playstate._createMonsterWall = function (x, y, side) {
    let sprite = this.monsterWalls.create(x, y, 'invisible-wall')
    sprite.anchor.set(side === "left" ? 1 : 0, 1)

    this.game.physics.enable(sprite) //物理性質
    sprite.body.immovable = true // 地板不能移動
    sprite.body.allowGravity = false
}
Playstate._createHud = function () {
    var NUMBERS_STR = '0123456789X '
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26, NUMBERS_STR, 6) // 圖檔, 每格寬度, 每格高度, 參考字串, 每排幾個(?)
    this.keyIcon = this.game.make.image(0, 19, 'icon:key')
    this.keyIcon.anchor.set(0, 0.5) //中心
    let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin')
    let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width, coinIcon.height / 2, this.coinFont)
    coinScoreImg.anchor.set(0, 0.5)
    this.hud = this.game.add.group()
    this.hud.add(coinIcon)
    this.hud.position.set(10, 10)
    this.hud.add(coinScoreImg)
    this.hud.add(this.keyIcon)
}
Playstate._createGameOverPopup = function () {
    var popupBackground = this.game.make.graphics(0, 0)
    popupBackground.beginFill(0xffffff);
    popupBackground.drawRoundedRect(0, 0, this.game.width * 0.4, this.game.height * 0.7, 35);
    popupBackground.endFill();
    var gameOverTextStyle = { font: "bold 57px Arial", fill: "#3FA9F5", boundsAlignH: "center" };
    var gameOverText = this.game.make.text(110, 100, this.coinPickupCount + " x", gameOverTextStyle);
    var IconCoin = this.game.make.image(gameOverText.width + gameOverText.x + 25, 105, 'popup:coin')
    IconCoin.scale.setTo(0.4,0.4)
    var title = this.game.make.image(popupBackground.width * 0.5, 30, 'popup:title')
    title.anchor.set(0.5, 0)
    title.scale.setTo(0.5,0.5)
    var text = this.game.make.image(popupBackground.width * 0.5, 200, 'popup:text')
    text.anchor.set(0.5, 0)
    text.scale.setTo(0.4,0.4)
    var restart = this.game.make.image(50, popupBackground.height * 0.7, 'popup:restart')
    restart.scale.setTo(0.35,0.35)
    restart.inputEnabled = true
    restart.input.useHandCursor = true
    restart.events.onInputDown.addOnce(function () {
        this.game.state.restart(true, false, { level: this.level })
    }, this)
    var link = this.game.make.image(restart.x + restart.width + 20, popupBackground.height * 0.7, 'popup:link')
    link.scale.setTo(0.35,0.35)
    link.inputEnabled = true
    link.input.useHandCursor = true
    link.events.onInputDown.add(function () {
        document.getElementById("linkURL").select()
        document.getElementById("linkURL").setSelectionRange(0, 99999)
        document.execCommand("copy")
        alert("已複製連結!")
    }, this)
    var logo = this.game.make.image(popupBackground.width * 0.5, popupBackground.height - 10, 'logo')
    logo.scale.setTo(0.4,0.4)
    logo.anchor.set(0.5, 1)
    logo.inputEnabled = true
    logo.input.useHandCursor = true
    logo.events.onInputDown.add(function () {
        window.open("https://meetstat.co/")
    }, this)
    this.gameoverPopup = this.game.add.group()
    this.gameoverPopup.x = this.game.width * 0.3
    this.gameoverPopup.y = this.game.height * 0.1
    this.gameoverPopup.add(popupBackground)
    this.gameoverPopup.add(gameOverText)
    this.gameoverPopup.add(IconCoin)
    this.gameoverPopup.add(title)
    this.gameoverPopup.add(text)
    this.gameoverPopup.add(link)
    this.gameoverPopup.add(restart)
    this.gameoverPopup.add(logo)
}
Playstate._createDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door')
    this.door.anchor.setTo(0.5, 1)
    this.game.physics.enable(this.door)
    this.door.body.allowGravity = false
}
Playstate._createKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key')
    this.key.anchor.set(0.5, 0.5)
    this.game.physics.enable(this.key)
    this.key.body.allowGravity = false
    this.key.y -= 3
    this.game.add.tween(this.key)  // 鑰匙上下浮動動畫
        .to({ y: this.key.y + 6 }, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true) // 會從動畫終點回到初始
        .loop()
        .start()
}
Playstate._handleInput = function () {
    if (this.keys.left.isDown) { //左
        this.character.move(-1)
    } else if (this.keys.right.isDown) { //右
        this.character.move(1)
    } else { //停
        this.character.move(0)
    }
    // 處理jump
    const JUMP_HOLD = 200 //ms
    if (this.keys.up.downDuration(JUMP_HOLD)) {
        let didJump = this.character.jump()
        if (didJump) {
            this.sfx.jump.play()
        }
    } else {
        this.character.stopJumpBoosting()
    }
}
// 處理碰撞
Playstate._handleCollisions = function () {
    // collide:碰撞  overlap:重疊
    this.game.physics.arcade.collide(this.spiders, this.platforms)
    this.game.physics.arcade.collide(this.spiders, this.monsterWalls)
    this.game.physics.arcade.collide(this.character, this.platforms)
    this.game.physics.arcade.overlap(this.character, this.coins, this._onTouchCoin, null, this)
    this.game.physics.arcade.overlap(this.character, this.spiders, this._onTouchMonster, null, this)
    this.game.physics.arcade.overlap(this.character, this.key, this._onTouchKey, null, this)
    this.game.physics.arcade.overlap(this.character, this.door, this._onTouchDoor, function (character, door) {
        return this.hasKey && character.body.touching.down  // true才會跑 _onTouchDoor()
    }, this)
}
Playstate._goToNextLevel = function () {
    this.camera.fade('#000000')
    this.camera.onFadeComplete.addOnce(function () {
        this.game.state.restart(true, false, { level: this.level + 1 })
    }, this)
}
Playstate._onTouchCoin = function (character, coin) {
    coin.kill()
    this.coinPickupCount += 1
    this.sfx.coin.play()
}
Playstate._onTouchMonster = function (character, monster) {
    if (character.body.velocity.y > 0) { // 垂直速度>0代表在空中墜落中
        monster.die() // 殺死怪物
        character.bounce()
        this.sfx.stomp.play()
    } else {
        character.die()
        this.sfx.stomp.play()
        character.events.onKilled.addOnce(function () {
            // this.game.state.restart(true, false, { level: this.level })
            this._createGameOverPopup()
        }, this)
        monster.body.touching = monster.body.wasTouching
    }
}
Playstate._onTouchKey = function (character, key) {
    this.sfx.key.play()
    key.kill()
    this.hasKey = true
}
Playstate._onTouchDoor = function (character, door) {
    door.frame = 1
    this.sfx.door.play()
    character.freeze() // 防止控制
    this.game.add.tween(character)
        .to({ x: this.door.x, alpha: 0 }, 500, null, true)
        // .onComplete.addOnce(this._goToNextLevel, this)
        .onComplete.addOnce(this._createGameOverPopup, this)
}
Playstate.init = function (data) {

    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true; //canvas對齊
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; //放大至符合畫面
    this.level = (data.level || 0) % LEVEL_COUNT
    this.coinPickupCount = 0
    this.hasKey = false
    this.game.renderer.renderSession.roundPixels = true //解決人物鋸齒模糊
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP
    })
}
window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.Auto, 'game')
    game.state.add('play', Playstate)
    game.state.start('play', true, false, { level: 0 })
}