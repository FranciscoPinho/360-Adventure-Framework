AFRAME.registerComponent('controls-event-handlers', {
    init:  function () {
      this.trackpadPressed = this.trackpadPressed.bind(this)
      this.trackpadUp = this.trackpadUp.bind(this)
      this.trackpadtouchStart = this.trackpadtouchStart.bind(this)
      this.trackpadtouchEnd = this.trackpadtouchEnd.bind(this)
      this.triggerPressed = this.triggerPressed.bind(this)
      this.triggerUp = this.triggerUp.bind(this)
      this.gocontroller = {
        padpressed:false,
        touching:false,
        triggerpressed:false
      }
    },
    play: function () {
        document.addEventListener('trackpaddown',this.trackpadPressed)
        document.addEventListener('trackpadup',this.trackpadUp)
        document.addEventListener('trackpadtouchstart',this.trackpadtouchStart)
        document.addEventListener('trackpadtouchend',this.trackpadtouchEnd)
        document.addEventListener('triggerdown',this.triggerPressed)
        document.addEventListener('triggerup',this.triggerUp)
    },
    pause: function () {
        document.removeEventListener('trackpaddown',this.trackpadPressed)
        document.removeEventListener('trackpadup',this.trackpadUp)
        document.removeEventListener('trackpadchanged',this.trackpadtouchStart)
        document.removeEventListener('trackpadtouchend',this.trackpadtouchEnd)
        document.removeEventListener('triggerdown',this.triggerPressed)
        document.removeEventListener('triggerup',this.triggerUp)
    },
    trackpadPressed: function (evt) {
      this.gocontroller.padpressed=true;
    },
    trackpadUp: function (evt) {
      this.gocontroller.padpressed=false;
    },
    trackpadtouchStart: function (evt) {
      this.gocontroller.touching=true;
    },
    trackpadtouchEnd: function (evt) {
       this.gocontroller.touching=false;
    },
    triggerPressed: function (evt) {
       this.gocontroller.triggerpressed=true;
    },
    triggerUp: function (evt) {
       this.gocontroller.triggerpressed=false;
    },
  });