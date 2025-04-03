pc.script.attribute("url1", "string");
pc.script.attribute("url2", "string");
pc.script.attribute("disabled", "boolean", false);

pc.script.create('ad', function (context) {
    // ad height
    var WIDTH = 568;
    var HEIGHT = 320;

    var Ad = function (entity) {
        this._count = 0;
        this._parent = null;
        this._lastDisplay = new Date().getTime();
        this._maxFrequency = 30 * 1000; // max every 30 seconds
        this._urls = [];

        pc.events.attach(this);
    };

    Ad.prototype = {
        initialize: function () {
            if (this.url1) {
                this._urls.push(this.url1);
            }
            if (this.url2) {
                this._urls.push(this.url2);
            }
        },

        isSupportedPlatform: function () {
            return (/iphone|ipod|ipad|android|iemobile|silk|mobile/).test(navigator.userAgent.toLowerCase());
        },

        canShow: function () {
            if (this.disabled) {
                return false;
            }

            // only show ads with a max frequency
            var now = new Date().getTime();
            if(now - this._lastDisplay < this._maxFrequency) {
                return false;
            }

            return true;
        },

        show: function () {
            if (!this.isSupportedPlatform()) {
                return;
            }

            this._lastDisplay = new Date().getTime();

            // create background
            var background = document.createElement('div');
            background.style.position = "absolute";
            background.style.backgroundColor = "white";
            background.style.top = "0px";
            background.style.bottom = "0px";
            background.style.left = "0px";
            background.style.right = "0px";

            // create close button
            var img = document.createElement("img");
            img.style.position = "absolute";
            img.style.top = "0px";
            img.style.right = "0px";
            img.style.height = "44px";
            img.style.width = "44px";
            img.src = "https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/ad/button_x.png";
            img.addEventListener("click", function (e) {
                this.hide();
            }.bind(this), false);

            var container = document.createElement('div');
            container.style.position = "absolute";
            container.style.width = WIDTH + "px";
            container.style.height = HEIGHT + "px";
            container.style.top = "50%";
            container.style.marginTop = "-" + HEIGHT/2 + "px";
            container.style.left = "50%";
            container.style.marginLeft = "-" + WIDTH/2 + "px";

            var iframe = document.createElement('iframe');
            iframe.style.width = "568px";
            iframe.style.height = "320px";
            iframe.style.border = "none";

            url = this._urls[this._count];
            this._count++;
            this._count = this._count % this._urls.length;

            // create internal iframe and encode it
            // this is used to load the ad page
            var html = '<html><body style="margin:0px;padding:0px"><script src="' + url + '"><\/script><\/body><\/html>';
            iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);

            container.appendChild(iframe);
            background.appendChild(container);
            background.appendChild(img);
            document.body.appendChild(background);

            this._parent = background;
        },

        hide: function () {
            this._parent.parentNode.removeChild(this._parent);
            this.fire("complete");
        }
    };

    return Ad;
});
