AFRAME.registerComponent('cutscene-event-emitter', {
    schema: {
        destination:{type:'string'},
        newFlag:{type:'string',default:"seen"}
    },
    init: function () {
        this.onVideoFrame = this.onVideoFrame.bind(this);
        this.video = document.querySelector(this.el.getAttribute('src'))
    },
    play: function () {
        this.video.ontimeupdate = this.onVideoFrame
    },
    pause: function () {
        this.video.ontimeupdate = null
    },
    onVideoFrame: function (event) {
        if(this.video.currentTime>=this.video.duration){
            const {destination,newFlag}=this.data;
            const eventDetail = {
                origin:this.el,
                destinationURL:destination
            }
            this.el.emit('clickNavigation',eventDetail,true)
            this.el.emit('addFlag',{flagKey:this.el.getAttribute('id'),flagValue:newFlag})
            AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
            this.video.ontimeupdate = null
        }
    }
});