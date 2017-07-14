<template>
  <div class="my-music">
    <div class="music-bg"></div>
    <main class="music-main">
      <div class="main-body">
        <div class="body-bg" @click="closeSideBar"></div>
        <div class="body-cover" @click="closeSideBar">
          <div v-for="item in 3"></div>
        </div>
        <div class="body-lyrics"></div>
        <transition name="slide-fade">
          <div class="body-side-bar" v-if="sideBarVisible">
            <div class="bar-header">
              <span @click="showSideBar">ㄨ</span>
              <div
                v-for="item in tabs"
                :class="{ active: item === activeTab }"
                @click="toggleTab(item)">
                {{ item }}
              </div>
            </div>
            <div class="bar-content">
              <ul v-if="activeTab === 'Playlist'">
                <li v-for="item in musicList" :class="{ active: item === activeMusic }" @click="handleSelect(item)">
                  <div v-if="item === activeMusic && paused">
                    <span class="active-icon" v-for="item in 3"></span>
                  </div>
                  {{ item.replace(/\.mp3$/, '') }}
                </li>
              </ul>
              <ul v-else>
                <li v-for="item in historyList" :class="{ active: item === activeMusic }" @click="handleSelect(item)">
                  <div v-if="item === activeMusic && paused">
                    <span class="active-icon" v-for="item in 3"></span>
                  </div>
                  {{ item.replace(/\.mp3$/, '') }}
                </li>
              </ul>
            </div>
          </div>
        </transition>
      </div>
      <div class="main-footer">
        <div class="footer-left">
          <span class="footer-previous icon-previous" @click="toggleMusic('previous')"></span>
          <span class="footer-play" :class="[paused ? 'icon-pause' : 'icon-play']" @click="toggleAudio"></span>
          <span class="footer-next icon-next" @click="matchNextSong('next')"></span>
        </div>
        <div class="footer-center">
          <div class="center-progressBar">
            <div class="music-info">
              {{ activeMusic.replace(/\.mp3$/, '') }}
              <span>{{ currentTime }}&ensp;/&ensp;{{ audioDuration }}</span>
            </div>
            <div class="progressBar-main">
              <input
                type="range"
                v-model="progressValue"
                @input="changeProgress"
                min="0"
                :max="audio.duration">
              <span :style="{ width: `${ audio.currentTime / audio.duration * 100 }%` }"></span>
            </div>
          </div>
        </div>
        <div class="footer-right">
          <i :class="[`icon-${ matchPlayMode }`]" @click="changePlayMode"></i>
          <i :class="[`icon-${ matchVolume }`]" @click="showVolume"></i>
          <i class="icon-list" @click="showSideBar"></i>
          <div class="right-volume" v-if="volumeVisible">
            <div class="volume-main">
              <input type="range" v-model="volumeValue" @input="changeVolume">
              <span class="progress-bar" :style="{ width: `${ volumeValue }%` }"></span>
            </div>
          </div>
        </div>
      </div>
    </main>
    <audio
      id="audio"
      :src="'../../static/music-list/' + activeMusic"
      controls="controls"
      ref="audio"
      @timeupdate="getCurrentTime"
      @ended="matchNextSong()"
      @canplay="getDurationValue">
    </audio>
  </div>
</template>

<script>
  export default {
    name: 'index', 

    data() {
      return {
        musicList: ['Halo.mp3', 'Big Jet Plane.mp3', 'Stay With Me.mp3', 'Take You Away.mp3'],
        audio: '',
        audioDuration: '00.00',
        paused: false,
        currentTime: '00.00',
        volumeValue: 100,
        progressValue: 0,
        number: 0,
        activeMusic: '',
        historyList: [],
        playModeList: ['normal', 'repeat', 'random'],
        activeMode: 'normal',
        volumeVisible: false,
        sideBarVisible: false,
        tabs: ['Playlist', 'History'],
        activeTab: 'Playlist',
        toggleLock: false
      }
    },

    computed: {
      matchPlayMode() {
        const playMode = this.playModeList[0];
        if (playMode === 'normal') {
          return 'normal';
        } else if (playMode === 'repeat') {
          return 'repeat';
        } else {
          return 'random';
        }
      },

      matchVolume() {
        if (this.volumeValue) {
          return 'volume';
        } else {
          return 'mute';
        }
      }
    },

    methods: {
      play() {
        this.audio.play();
        this.paused = true;
      },

      pause() {
        this.audio.pause();
        this.paused = false;
      },

      toggleAudio() {
        if (this.paused) {
          this.pause();
        } else {
          this.play();
        }
      },

      fomatTime(s) {
        const format = (num, len, str) => {
          return Math.floor(num).toString().padStart(len, str);
        };

        if (s >= 60) {
          const minute = format(s / 60, 2, '00');
          const second = format(s % 60, 3, ':00');
          return minute + second;
        } else {
          return format(s, 5, '00:00');
        }
      },

      getCurrentTime() {
        this.currentTime = this.fomatTime(this.audio.currentTime);
        this.progressValue = this.audio.currentTime;
      },

      getDurationValue() {
        this.audioDuration = this.fomatTime(this.audio.duration);
        this.toggleLock = false;
      },

      changeVolume() {
        this.audio.volume = this.volumeValue / 100;
      },

      changeProgress() {
        this.audio.currentTime = this.progressValue;
      },

      toggleMusic(type) {
        if (this.toggleLock) return;
        this.toggleLock = true;

        new Promise((resolve, reject) => {
          if (type === 'next') {
            if (this.number > this.musicList.length - 2) this.number = -1;
            this.number++;
            this.activeMusic = this.musicList[this.number];
          } else if (type === 'previous') {
            if (this.number < 1) this.number = this.musicList.length;
            this.number--;
            this.activeMusic = this.musicList[this.number];
          } else if (type === 'random') {
            const getRandomNum = () => {
              const randomNum = Math.floor(Math.random() * this.musicList.length);
              if (randomNum === this.number) {
                return getRandomNum();
              } else {
                return randomNum;
              }
            };
            const randomNum = getRandomNum();
            this.activeMusic = this.musicList[randomNum];
            this.number = randomNum;
          }

          this.historyRecord();
          resolve();
        }).then(() => {
          this.play();
        });
      },

      historyRecord() {
        this.historyList.unshift(this.activeMusic);
        this.historyList = [...new Set(this.historyList)];
      },

      changePlayMode() {
        this.playModeList.push(this.playModeList.shift());
        this.activeMode = this.playModeList[0];
      },

      showVolume() {
        this.volumeVisible = !this.volumeVisible;
      },

      closeVolume() {
        this.volumeVisible = false;
      },

      showSideBar() {
        this.sideBarVisible = !this.sideBarVisible;
      },

      closeSideBar() {
        this.sideBarVisible = false;
        this.closeVolume();
      },

      toggleTab(item) {
        this.activeTab = item;
      },

      matchNextSong(param) {
        if (this.activeMode === 'normal') {
          this.toggleMusic('next');
        } else if (this.activeMode === 'random') {
          this.toggleMusic('random');
        } else if (this.activeMode === 'repeat' && param) {
          this.toggleMusic('next');
        } else if (this.activeMode === 'repeat') {
          this.toggleMusic();
        }
      },

      handleSelect(item) {
        new Promise((resolve, reject) => {
          this.activeMusic = item;
          resolve();
        }).then(() => {
          this.play();
        });
      },

      onSpace() {
        this.toggleAudio;
      }
    },

    mounted() {
      this.audio = this.$refs.audio;  
      this.activeMusic = this.musicList[0];
      this.historyRecord();
      document.addEventListener('keydown', (e) => {
        const value = this.volumeValue;
        const num = 20;
        if (e.keyCode == 32) this.toggleAudio();
        if (e.keyCode == 13) this.showSideBar();
        if (e.keyCode == 187) {
          if (value < 100) {
            this.volumeValue = value + num;
          } else {
            this.volumeValue = 100;
          }
        };
        if (e.keyCode == 189) {
          if (value > 0) {
            this.volumeValue = value - num;
          } else {
            this.volumeValue = 0;
          }
        };
      });
    }
  }
</script>


<style lang="less">
  @baseColor: #50AFF2;
  .my-music {
    height: 100%;
    user-select: none;

    #audio {
      display: none;
    }

    .music-bg {
      background-image: url('../assets/1.jpg');
      background-repeat: no-repeat;
      background-size: cover;
      height: 100%;
      transform: scale(1.03);
      filter: blur(10px);
    }

    .music-main {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      margin: auto;
      width: 850px;
      height: 580px;
      overflow: hidden;

      .main-body {
        position: relative;
        height: 500px;

        .body-bg {
          height: 100%;
          background-color: #fff;
          opacity: .9;
        }

        .body-cover {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          width: 200px;
          height: 200px;
          margin: auto;
          text-align: center;

          div {
            height: 100%;
            width: 100%;
            background: url('../assets/1.jpg') no-repeat;
            background-position: center;
            background-size: cover;
            // -webkit-box-reflect: below 0 -webkit-linear-gradient(top,rgba(250,250,250,0),rgba(250,250,250,.0) 70%,rgba(250,250,250, .5));
          }

          div:nth-of-type(1) {
            position: absolute;
            transform: scale(1.04);
            filter: blur(3px);
            -webkit-box-reflect: below 0 -webkit-linear-gradient(top,rgba(250,250,250,0),rgba(250,250,250, 0) 75%,rgba(250,250,250, .8));
          }

          div:nth-of-type(2) {
            position: absolute;
            filter: blur(50px);
          }

          div:nth-of-type(3) {
            position: relative;
          }
        }

        .body-side-bar {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 360px;
          background-color: #F4F7FA;
          opacity: .95;
          box-shadow: -2px 0 12px rgba(0, 0, 0, .1);
          display: flex;
          flex-direction: column;

          .bar-header {
            padding: 15px 30px 20px 30px;
            margin-left: 50px;
            line-height: 60px;
            background-color: #fff;

            span {
              position: absolute;
              margin-left: -62px;
              color: #999;
              cursor: default;

              &:hover {
                color: #333;
              }
            }

            div {
              display: inline-block;
              font-size: 18px;
              color: #666;
              font-weight: 600;

              &:hover {
                color: #333;
                cursor: default;
              }

              &.active {
                color: #333;

                &:after {
                  content: '';
                  position: absolute;
                  width: 12px;
                  height: 4px;
                  background-color: @baseColor;
                  margin-top: -10px;
                }
              }

              &:not(:last-child) {
                margin-right: 35px;
              }
            }
          }

          .bar-content {
            padding: 0 30px 0 30px;
            margin-left: 50px;
            line-height: 50px;
            background-color: #fff;
            flex-grow: 1;
            overflow: auto;

            li {
              transition: .2s;

              &:hover {
                color: @baseColor;
                cursor: default;
              }

              &.active {
                color: @baseColor;
                font-weight: 500;
              }

              div {
                position: absolute;
                margin-left: -63px;

                span {
                  display: inline-block;
                  width: 3px;
                  background-color: skyblue;
                  margin-right: 3px;
                  transform-origin: bottom center;

                  &.active-icon {
                    animation: 1s 1s dance linear infinite forwards normal;
                  }

                  &:nth-of-type(1) {
                    height: 4px;
                  }

                  &:nth-of-type(2) {
                    height: 9px;
                  }

                  &:nth-of-type(3) {
                    height: 6px;
                  }


                  @keyframes dance {
                    0% {
                      transform: scaleY(1);
                    }
                    50% {
                      transform: scaleY(1.6);
                    }
                    100% {
                      transform: scaleY(1);
                    }
                  }
                }
              }
            }
          }
        }
      }

      .main-footer {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 70px;
        background-color: #fff;
        border-top: 1px solid #ebebeb;

        .footer-left {
          padding-left: 30px;

          span {
            display: inline-block;
            height: 44px;
            width: 44px;
            border-radius: 100%;
            background-color: #fff;
            text-align: center;
            line-height: 44px;
            color: @baseColor;
            box-shadow: 0 3px 8px rgba(80, 175, 242, .3);

            &:nth-of-type(2) {
              letter-spacing: -4px;
            }

            &:not(:last-child) {
              margin-right: 15px;
            }
          }
        }

        .footer-center {
          .center-progressBar {
            align-items: center;

            .music-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 8px;
              margin-top: -6px;
              font-size: 14px;

              span {
                font-size: 12px;
                color: #999;
              }
            }

            .progressBar-main {
              position: relative;
              border-radius: 3px;
              height: 4px;
              width: 420px;

              input[type="range"] {
                -webkit-appearance: none;
                background-color: #ebebeb;
                border-radius: inherit;
                outline: none;
                height: 100%;
                width: 100%;
                vertical-align: top;
                margin: 0;
              }

              span {
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                border-radius: inherit;
                background-color: @baseColor;
              }
            }
          }
        }

        .footer-right {
          display: flex;
          align-items: center;
          padding-right: 30px;

          & > i {
            color: #484F54;
            opacity: .7;

            &:hover {
              opacity: 1;
            }
          }

          & > i:not(:last-of-type) {
            margin-right: 20px;
          }

          .right-volume {
            position: absolute;
            margin-left: -12px;
            margin-top: -80px;
            transform: rotate(-90deg);
            padding: 20px 10px;
            background-color: #fff;
            box-shadow: 0 0 8px rgba(0, 0, 0, .3);
            border-radius: 5px;
            z-index: 3;

            .volume-main {
              position: relative;
              height: 4px;
              width: 100px;
              font-size: 0;
              border-radius: 3px;
            }

            input[type="range"] {
              -webkit-appearance: none;
              background-color: #ebebeb;
              border-radius: inherit;
              outline: none;
              height: 100%;
              width: 100%;
              vertical-align: top;
              margin: 0;
            }
            .progress-bar {
              position: absolute;
              top: 0;
              left: 0;
              bottom: 0;
              border-radius: inherit;
              background-color: @baseColor;
            }
          }
        }
      }
    }

    audio {
      width: 1000px;
      display: block;
    }
  }
</style>
