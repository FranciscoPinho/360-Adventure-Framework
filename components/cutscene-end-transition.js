AFRAME.registerComponent('cutscene-end-transition', {
    schema: {
        destination:{type:'string',default:""},
        newURL:{type:'string',default:""},
        newFlag:{type:'string',default:"seen"},
        endTime:{type:'number'}
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
        let endPriorToEnd = false
        if(this.data.endTime){
            if(video.currentTime>=this.data.endTime)
                endPriorToEnd=true
        }
        if(video.currentTime>=video.duration || endPriorToEnd){
            const {newURL,destination,newFlag}=this.data;
            AFRAME.scenes[0].emit('addFlag',{flagKey:el.getAttribute('id'),flagValue:newFlag})
            if(newURL){
                AFRAME.scenes[0].emit('changeURL',{url:newURL})
                this.video.ontimeupdate = null
                return
            }
            const eventDetail = {
                origin:el,
                destinationURL:destination
            }
            el.emit('clickNavigation',eventDetail,true)
            AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
  
            this.video.ontimeupdate = null
        }
    }
});