AFRAME.registerComponent('navigation-event-emitter', {
    schema:{
        destination: {type:'string'}
    },
    init:  function () {  
        this.clickNavigation = this.clickNavigation.bind(this)
    },
    play: function() {
        this.el.addEventListener('click',this.clickNavigation)
    },
    pause: function() {
        this.el.removeEventListener('click',this.clickNavigation)
    },
    clickNavigation: function () {
        const {destination,destinationSilent}=this.data;
        const eventDetail = {
            origin:this.el.parentNode,
            destinationURL:destination
        }
        this.el.emit('clickNavigation',eventDetail,true)
    }
  });