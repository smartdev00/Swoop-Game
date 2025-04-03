pc.script.attribute("disabled", "boolean", false);

pc.script.create('gima', function (context) {

    var DummyContent = {
        currentTime: 0
    };

    // Creates a new Gima instance
    var Gima = function (entity) {
        this.entity = entity;

        this.nonLinearSlotHeight = 360;
        this.nonLinearSlotWidth = 640;
        this.linearSlotHeight = 360;
        this.linearSlotWidth = 640;

        this._lastDisplay = new Date().getTime();
        this._maxFrequency = 60 * 1000;
        pc.events.attach(this);
    };

    Gima.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {

        },

        canShow: function () {
            if (this.disabled) {
                return false;
            }

            if (typeof(google) === "undefined") {
                return;
            }

            // only show ads with a max frequency
            var now = new Date().getTime();
            if(now - this._lastDisplay < this._maxFrequency) {
                return false;
            }

            return true;
        },

        show: function () {
            this._lastDisplay = new Date().getTime();

            this._container = document.createElement("div");
            this._container.style.position = "absolute";
            this._container.style.height = "100%";
            this._container.style.top = "0px";
            this._container.style.bottom = "0px";
            this._container.style.left = "0px";
            this._container.style.right = "0px";
            this._container.style.backgroundColor = "#1d292c";

            var div = document.createElement("div");
            div.id = "adContainer";
            div.style.position = "relative";
            div.style.top = "50%";
            div.style.margin = "auto auto";
            div.style.width = this.linearSlotWidth.toString() + "px";
            div.style.height = this.linearSlotHeight.toString() + "px";
            div.style.transform = "translate(0, -50%)";

            this._container.appendChild(div)
            document.body.appendChild(this._container);

            this._requestAds();
            this.playing = true;
        },

        showSkip: function () {

        },

        _hide: function () {
            if (this._adsManager) {
                this._adsManager.stop();
            }

            this.playing = false;

            if (this._container) {
                this._container.parentNode.removeChild(this._container);
                this._container = null;
            }
        },

        _createAdDisplayContainer: function() {
            // We assume the adContainer is the DOM id of the element that will house
            // the ads.
            this._adDisplayContainer = new google.ima.AdDisplayContainer(document.getElementById('adContainer'));
            // this._videoContent = document.getElementById("contentElement");
        },

        _requestAds: function () {
            // Create the ad display container.
            this._createAdDisplayContainer();

            // Initialize the container. Must be done via a user action on mobile devices.
            this._adDisplayContainer.initialize();

            // Create ads loader.
            this._adsLoader = new google.ima.AdsLoader(this._adDisplayContainer);

            // Listen and respond to ads loaded and error events.
            this._adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._onAdsManagerLoaded.bind(this), false);
            this._adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._onAdError.bind(this), false);



            // Request video ads.
            var adsRequest = new google.ima.AdsRequest();
            adsRequest.adTagUrl = "http://googleads.g.doubleclick.net/pagead/ads?ad_type=video&" +
            "client=" + "ca-games-pub-4968145218643279" +
            "&videoad_start_delay=0&" +
            "description_url=http%3A%2F%2Fwww.google.com&max_ad_duration=40000&adtest=on";

            // adsRequest.adTagUrl = 'http://pubads.g.doubleclick.net/gampad/ads?sz=400x300&' +
            // 'iu=%2F6062%2Fiab_vast_samples&ciu_szs=300x250%2C728x90&gdfp_req=1&' +
            // 'env=vp&output=xml_vast2&unviewed_position_start=1&url=' +
            // '[referrer_url]&correlator=[timestamp]&cust_params=iab_vast_samples' +
            // '%3Dlinear';

            // Specify the linear and nonlinear slot sizes. This helps the SDK to
            // select the correct creative if multiple are returned.
            adsRequest.linearAdSlotWidth = this.linearSlotWidth;
            adsRequest.linearAdSlotHeight = this.linearSlotHeight;

            adsRequest.nonLinearAdSlotWidth = this.nonLinearSlotWidth;
            adsRequest.nonLinearAdSlotHeight = this.nonLinearSlotHeight;

            this._adsLoader.requestAds(adsRequest);
        },

        _onAdsManagerLoaded: function(adsManagerLoadedEvent) {
            // Get the ads manager.
            this._adsManager = adsManagerLoadedEvent.getAdsManager(DummyContent);  // should be set to the content video element

            // Add listeners to the required events.
            this._adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._onAdError.bind(this));
            this._adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this._onContentPauseRequested.bind(this));
            this._adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this._onContentResumeRequested.bind(this));
            this._adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, this._onAdEvent.bind(this));

            // Listen to any additional events, if necessary.
            this._adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, this._onAdEvent.bind(this));
            this._adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, this._onAdEvent.bind(this));
            this._adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, this._onAdEvent.bind(this));
            this._adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, this._onAdEvent.bind(this));
            this._adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED, this._onAdEvent.bind(this));
            this._adsManager.addEventListener(google.ima.AdEvent.Type.USER_CLOSE, this._onAdEvent.bind(this));

            try {
                // Initialize the ads manager. Ad rules playlist will start at this time.
                this._adsManager.init(640, 360, google.ima.ViewMode.NORMAL);

                // Call play to start showing the ad. Single video and overlay ads will
                // start at this time; the call will be ignored for ad rules.
                this._adsManager.start();
            } catch (adError) {
                // An error may be thrown if there was a problem with the VAST response.
                // this._videoContent.play();
            }
        },

        _onAdEvent: function (adEvent) {
            // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
            // don't have ad object associated.
            var ad = adEvent.getAd();
            switch (adEvent.type) {
                case google.ima.AdEvent.Type.LOADED:
                    // This is the first event sent for an ad - it is possible to
                    // determine whether the ad is a video ad or an overlay.
                    if (!ad.isLinear()) {
                        // Position AdDisplayContainer correctly for overlay.
                        // Use ad.width and ad.height.
                    }
                break;
                case google.ima.AdEvent.Type.STARTED:
                    // This event indicates the ad has started - the video player
                    // can adjust the UI, for example display a pause button and
                    // remaining time.
                    if (ad.isLinear()) {
                        // For a linear ad, a timer can be started to poll for
                        // the remaining time.
                        intervalTimer = setInterval(
                            function() {
                              var remainingTime = this._adsManager.getRemainingTime();
                            }.bind(this),
                        300); // every 300ms
                  }
                break;
                case google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED:
                    var data = adEvent.getAdData();
                break;
                case google.ima.AdEvent.Type.SKIPPED:
                    console.log("skipped");
                    break;
                case google.ima.AdEvent.Type.USER_CLOSE:
                    console.log("closed");
                    break;
                case google.ima.AdEvent.Type.COMPLETE:
                    // This event indicates the ad has finished - the video player
                    // can perform appropriate UI actions, such as removing the timer for
                    // remaining time detection.
                    if (ad.isLinear()) {
                        clearInterval(intervalTimer);
                    }
                    this._hide();
                    this.fire("complete");
                break;
            }
        },

        _onAdError: function (adErrorEvent) {
          // Handle the error logging.
          console.log(adErrorEvent.getError());
          if (this._adsManager) {
            this._adsManager.destroy();
          }

          this._hide();
          this.fire("complete");
        },

        _onContentPauseRequested: function () {
          //this._videoContent.pause();
          // This function is where you should setup UI for showing ads (e.g.
          // display ad timer countdown, disable seeking etc.)
          // setupUIForAds();
        },

        _onContentResumeRequested: function () {
          //this._videoContent.play();
          // This function is where you should ensure that your UI is ready
          // to play content. It is the responsibility of the Publisher to
          // implement this function when necessary.
          // setupUIForContent();
        }
    };

    return Gima;
});
