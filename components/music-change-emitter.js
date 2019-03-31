AFRAME.registerComponent('music-change-emitter', {
    schema:{
        newsource: {type:'string',default:''},
        loop: {type:'boolean', default:true},
        volume: {type:'number', default:0.5},
        cacheDuration: {type:'boolean', default:true}
    },
    play: function() {
        const {newsource,loop,volume,cacheDuration} = this.data
        let eventDetail = {
            newsource:newsource,
            loop:loop,
            volume:volume,
            cacheDuration:cacheDuration
        }
        this.el.emit('music-change',eventDetail,true)
    }
  });