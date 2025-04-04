pc.script.create('ui_gameover', function (context) {
    var Ui_gameover = function (entity) {
        this.entity = entity;
        this.score = 0;
    };

    Ui_gameover.prototype = {
        initialize: function () {
            this.quitButton = this.entity.findByName('SpriteExit').script.sprite;
            this.restartButton = this.entity.findByName('SpriteRestart').script.sprite;
            this.shareButton = this.entity.findByName('SpriteShare').script.sprite;
            this.spriteGameover = this.entity.findByName('SpriteGameover').script.sprite;
            this.spriteHighscore = this.entity.findByName('SpriteHiscore').script.sprite;
            this.spriteScoreBg = this.entity.findByName('SpriteScoreBg').script.sprite;
            this.spriteHighScoreBg = this.entity.findByName('SpriteHiScoreBg').script.sprite;
            this.shareButton = this.entity.findByName('SpriteShare').script.sprite;
            this.scoreText = this.entity.findByName('TextScore').script.font_renderer;
            this.scoreTextShadow = this.entity.findByName('TextScoreShadow').script.font_renderer;

            this.restartButton.on('click', this.onRestartClicked, this);
            this.quitButton.on('click', this.onQuitClicked, this);
            this.shareButton.on('click', this.onShareClicked, this);

            this.game = context.root.findByName('Game').script.game;
            if ((/iphone|ipod|ipad|android|iemobile|silk|mobile/).test(navigator.userAgent.toLowerCase())) {
                // use leadbolt
                this.ad = context.root.findByName("Game").script.ad;
            } else {
                // use Google IMA
                // load google script
                var script = document.createElement("script");
                script.setAttribute("src", "http://imasdk.googleapis.com/js/sdkloader/ima3.js");
                document.head.appendChild(script);

                this.ad = context.root.findByName("Game").script.gima;
            }

        },

        onRestartClicked: function () {
            this.game.audio.playClickSound();
            this.game.restart();
        },

        onQuitClicked: function () {
            this.game.audio.playClickSound();
            this.game.splashScreen();
        },

        onShareClicked: function () {
            this.game.audio.playClickSound();
            window.open(pc.string.format("https://twitter.com/intent/tweet?text=I%20just%20scored%20{0}%20in%20Swooop%20by%20@playcanvas.%20Beat%20that!%20http://swooop.playcanvas.com", this.score));
        },

        setScore: function (score, isHighScore) {
            this.score = score;
            var txt = score.toString();
            this.scoreText.text = txt;
            this.scoreTextShadow.text = txt;
            this.spriteGameover.entity.enabled = !isHighScore;
            this.spriteHighscore.entity.enabled = isHighScore;
            this.spriteScoreBg.entity.enabled = !isHighScore;
            this.spriteHighScoreBg.entity.enabled = isHighScore;
        },

        onEnable: function () {
            if (this.ad && this.ad.canShow()) {
                var music = this.game.audio.isMusicEnabled();
                var sounds = this.game.audio.areSoundsEnabled();

                this.game.audio.toggleMusic(false);
                this.game.audio.toggleSounds(false);
                this.ad.show();
                this.ad.on("complete", function () {
                    this.game.audio.toggleMusic(music);
                    this.game.audio.toggleSounds(sounds);
                }, this);
            }
        }
    };

    return Ui_gameover;
});
