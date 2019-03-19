AFRAME.registerComponent('music-change-emitter', {
    schema:{
        newsource: {type:'string',default:''},
        loop: {type:'boolean', default:true}
    },
    play: function() {
        const {newsource,loop} = this.data
        let eventDetail = {
            newsource:newsource,
            loop:loop
        }
        this.el.emit('music-change',eventDetail,true)
    }
  });