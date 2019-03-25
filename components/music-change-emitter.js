AFRAME.registerComponent('music-change-emitter', {
    schema:{
        newsource: {type:'string',default:''},
        loop: {type:'boolean', default:true},
        volume: {type:'number', default:0.5}
    },
    play: function() {
        const {newsource,loop,volume} = this.data
        let eventDetail = {
            newsource:newsource,
            loop:loop,
            volume:volume
        }
        this.el.emit('music-change',eventDetail,true)
    }
  });