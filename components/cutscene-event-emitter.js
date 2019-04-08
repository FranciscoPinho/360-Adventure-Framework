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
        const {el,video} = this
        if(video.currentTime>=video.duration){
            const {destination,newFlag}=this.data;
            const eventDetail = {
                origin:el,
                destinationURL:destination
            }
            el.emit('clickNavigation',eventDetail,true)
            el.emit('addFlag',{flagKey:el.getAttribute('id'),flagValue:newFlag})
            AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
            this.video.ontimeupdate = null
        }
    }
});