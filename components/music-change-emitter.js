AFRAME.registerComponent('music-change-emitter', {
    schema:{
        newsource: {type:'string',default:''}
    },
    play: function() {
        this.el.emit('music-change',{newsource:this.data.newsource},true)
    }
  });