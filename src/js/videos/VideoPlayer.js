const $ = require('common/common.js').jQuery;

const width = 1920;
const height = 1080;

// The VideoPlayer class acts as a common API wrapper for a native <video>
// element or a YouTube player
class VideoPlayer {

  // create a videoplayer using the given JSON info. The callback is invoked
  // when the video is ready to play
  constructor(info, callback) {
    const self = this;

    this.info = info;
    this.type = info.youtube_id ? 'youtube' : 'mp4';

    // create the thumbnail structure
    this.containerElement = $('<div></div>')
      .addClass('video-container')
      .prependTo('#videos')
      .hide();

    this.thumbnailElement = $('<div></div>')
      .addClass('thumbnail')
      .data('player', this);

    this.posterElement = $('<div></div>')
      .addClass('poster')
      .appendTo(this.thumbnailElement);

    this.overlayElement = $('<div></div>')
      .addClass('overlay')
      .appendTo(this.thumbnailElement);

    this.playButtonElement = $('<div></div>')
      .addClass('play-button')
      .appendTo(this.overlayElement);

    this.titleElement = $('<h1></h1>')
      .appendTo(this.overlayElement)
      .setLocalizedText(info, 'title');

    this.durationElement = $('<h2></h2>')
      .appendTo(this.overlayElement);

    // create the actual video element (native or youtube)
    if (this.youtube) {
      const elementId = `yt_${info.youtube_id}`;
      const temp = $('<div></div>')
        .attr('id', elementId)
        .appendTo(this.containerElement);

      this.player = new YT.Player(elementId, {
        height,
        width,
        videoId: info.youtube_id,
        playerVars: {
          controls: 0,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        },
        events: {
          onReady: function () {
            const minutes = self.duration / 60 | 0;
            const seconds = self.duration % 60;
            self.durationElement.text(`${minutes}:${("00"+seconds).slice(-2)}`);
            self.posterElement.css('background-image', `url(${self.posterUrl})`);
            callback.call(self);
          },
          onStateChange: function (event) {
            switch(event.data) {
            case YT.PlayerState.ENDED:
              self.onended();
              break;
            case YT.PlayerState.PAUSED:
              self.onpause();
              break;
            case YT.PlayerState.PLAYING:
              self.onplaying();
              break;
            case YT.PlayerState.BUFFERING:
              self.onseeking();
              break;
            default:
            }
          }
        }
      });

    } else {
      this.player = document.createElement('video');

      $(this.player).attr({
        width: width,
        height: height,
        preload: 'auto',
        playsinline: true,
        controls: false
      });

      if (this.posterUrl) {
        $(this.player).attr({
          poster: this.posterUrl,
          preload: 'metadata'
        });
      }

      this.player.oncanplay = function () {
        const minutes = self.duration / 60 | 0;
        const seconds = self.duration % 60;
        self.durationElement.text(`${minutes}:${("00"+seconds).slice(-2)}`);
        self.posterElement.css('background-image', `url(${self.posterUrl})`);
        callback.call(self);
      };

      this.player.onplaying = function () {
        self.onplaying();
      };

      this.player.onpause = function () {
        if (self.player.ended) {
          self.player.currentTime = 0;
        }
        self.onpause();
      };

      this.player.onended = function () {
        self.player.currentTime = 0;
        self.onended();
      };

      this.player.onseeking = function () {
        self.onseeking();
      };

      this.player.onseeked = function () {
        self.onseeked();
      };

      this.player.onclick = function () {
        self.pause();
      };

      this.player.src = info.mp4_url;
      this.containerElement.append(this.player);
    }
  }

  // Get a poster image for the video.
  // For youtube video's that means deriving a url from the youtube ID, which
  // is technically undocumented/informal. For a native video, the video is
  // drawn to a canvas, and the canvas's dataURL is returned
  get posterUrl() {
    if (this.youtube) {
      return `https://img.youtube.com/vi/${this.info.youtube_id}/sddefault.jpg`;
    } else {
      return this.info.mp4_poster_url || '';
      // try {
      //   console.log('Drawing thumbnail');
      //   const canvas = document.createElement('canvas');
      //   document.body.appendChild(canvas);
      //   canvas.width = this.player.width;
      //   canvas.height = this.player.height;
      //
      //   const ctx = canvas.getContext('2d');
      //   ctx.fillRect(0, 0, canvas.width, canvas.height);
      //   ctx.drawImage(this.player, 0, 0, canvas.width, canvas.height);
      //   console.log('Drew thumbnail');
      //   return canvas.toDataURL();
      // } catch(e) {
      //   console.log(e);
      // }
      return "";
    }
  }

  // play the video
  play() {
    if (this.youtube) {
      this.player.playVideo();
    } else {
      this.player.play();
    }
  }

  // pause the video
  pause() {
    if (this.youtube) {
      this.player.pauseVideo();
    } else {
      this.player.pause();
    }
  }

  // stop the video
  stop() {
    if (this.youtube) {
      this.player.stopVideo();
    } else {
      this.player.currentTime = 0;
      if (!this.player.ended) {
        this.player.pause();
      }
    }
  }

  rewind() {
    if (this.youtube) {
      this.player.seekTo(0);
    } else {
      this.player.currentTime = 0;
    }
  }

  // event handler stubs
  onended () {}
  onplaying() {}
  onpause () {}
  onseeking () {}
  onseeked () {}

  // get whether the player's paused
  get paused() {
    if (this.youtube) {
      switch (this.player.getPlayerState()) {
        case YT.PlayerState.PLAYING:
        case YT.PlayerState.BUFFERING:
          return false;
        default:
          // UNSTARTED
          // BUFFERING
          // CUED
          // ENDED
          // ERROR
          return true;
      }
    } else {
      return this.player.paused;
    }
  }

  // get the video duration in seconds
  get duration() {
    if (this.youtube) {
      return this.player.getDuration() | 0;
    } else {
      return this.player.duration | 0;
    }
  }

  // get whether the player is a youtube player
  get youtube() {
    return this.type === 'youtube';
  }
}

module.exports = VideoPlayer;
