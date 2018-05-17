const $ = require('common/common.js').jQuery;

const width = 1920;
const height = 1080;

class TrailerPlayer {

    constructor(trailerObject, container, callback) {
        let self = this;

        let youtube = !!trailerObject.youtube_id;

        let trailerIntroduction = $(document.createElement('div'))
            .addClass('trailer-introduction')
            .appendTo(container);

        let trailerPlayer = $(document.createElement('div'))
            .addClass('trailer-player')
            .appendTo(container);

        let trailerTitle = $(document.createElement('h1'))
            .text(trailerObject.title_da)
            .appendTo(trailerIntroduction);

        // let trailerDescription = $(document.createElement('p'))
        //     .text(trailerObject.description_da)
        //     .appendTo(trailerIntroduction);
        //
        // let trailerUrl = $(document.createElement('p'))
        //     .text(trailerObject.url)
        //     .appendTo(trailerIntroduction);

        if (youtube) {
            let videoPlaceholder = $(document.createElement('div'))
                .addClass('video-wrapper')
                .appendTo(trailerPlayer);

            let elementId = 'yt_' + trailerObject.youtube_id;

            $(document.createElement('div'))
                .attr('id', elementId)
                .appendTo(videoPlaceholder);

            this.player = new YT.Player(elementId, {
                videoId: trailerObject.youtube_id,
                playerVars: {
                    height,
                    width,
                    fs: 0,
                    controls: 0,
                    enablejsapi: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    cc_load_policy: 0,
                    disablekb: 1,
                    autohide: 1,
                    iv_load_policy: 3
                },
                events: {
                    onReady() {
                        callback(self);
                    },
                    onError() {
                        self.onerror();
                    },
                    onStateChange(event) {
                        switch (event.data) {
                            case YT.PlayerState.ENDED:
                                self.onended();
                                break;
                            default:
                        }
                    }
                }
            });

            this.play = () => {
                self.player.playVideo();
            }

        } else {
            this.player = document.createElement('video');

            $(this.player)
                .attr('id', 'video-player')
                .attr('width', width)
                .attr('height', height);

            this.player.onloadeddata = () => {
                callback(self);
            };

            this.player.onerror = () => {
                self.onerror();
            };

            this.player.onended = () => {
                self.onended();
            };

            this.play = () => {
                self.player.play();
            };

            trailerPlayer.append(this.player);

            this.player.src = trailerObject.mp4_url;
        }
    }
}

module.exports = TrailerPlayer;
