AFRAME.registerComponent('cutscene-end-transition', {
    schema: {
        destination:{type:'string',default:""},
        newURL:{type:'string',default:""},
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
            const {newURL,destination,newFlag}=this.data;
            if(newURL){
                AFRAME.scenes[0].emit('changeURL',{url:newURL,flagKey:el.getAttribute('id'),flagValue:newFlag})
                this.video.ontimeupdate = null
                return
            }
            const eventDetail = {
                origin:el,
                destinationURL:destination
            }
            AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
            AFRAME.scenes[0].emit('addFlag',{flagKey:el.getAttribute('id'),flagValue:newFlag})
            el.emit('clickNavigation',eventDetail,true)
            this.video.ontimeupdate = null
        }
    }
});