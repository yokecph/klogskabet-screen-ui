const common = require('common/common.js');
const $ = common.jQuery;
const _ = require('lodash');

const TrailerPlayer = require('trailers/TrailerPlayer.js');

let trailers;
let activeTrailerIndex = 0;
let trailerContainer;
let trailersForPrint;

$(window).on('load', function () {
    let urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('deviceid')) {
        common.config.deviceId = urlParams.get('deviceid');
    } else if (!urlParams.has('deviceid') && !common.config.deviceId) {
        console.log('No device id specified');
        return;
    }

    $(document).keypress(function (e) {
        if (e.which === 13) {
            window.print();
        }
    });

    YT.ready(function () {
        common.content.load((json) => {
            trailers = json.trailers;
            trailerContainer = $('#trailers-container');
            trailersForPrint = $('#trailers-print');

            initializeTrailerPlayer(trailers[activeTrailerIndex++]);

            trailers.forEach((trailer) => {
                let trailerForPrint = $(document.createElement('div'))
                    .addClass('trailer-for-print')
                    .appendTo(trailersForPrint);

                $(document.createElement('h3'))
                    .text(trailer.title_da)
                    .appendTo(trailerForPrint);
            });
        });
    });
});

function nextVideo() {
    if (trailers.length === activeTrailerIndex) {
        activeTrailerIndex = 0;
    }

    setTimeout(() => {
        trailerContainer.empty();
        initializeTrailerPlayer(trailers[activeTrailerIndex++]);
    }, 1500)
}

function initializeTrailerPlayer(trailer) {

    new TrailerPlayer(trailer, trailerContainer, (player) => {

        // On error event fires twice. Use debounce to only catch one
        player.onerror = _.debounce(() => {
            nextVideo();
        }, 1500);

        player.onended = function () {
            trailerContainer.find('.trailer-player').fadeOut(750, () => {
                nextVideo();
            });
        };

        trailerContainer.find('.trailer-introduction').fadeIn(750, () => {
            setTimeout(() => {
                trailerContainer.find('.trailer-introduction').fadeOut(750, () => {
                    trailerContainer.find('.trailer-player').fadeIn(750, () => {
                        player.play();
                    });
                });
            }, 5000);
        });
    });
}


