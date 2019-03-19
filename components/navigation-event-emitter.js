AFRAME.registerComponent('navigation-event-emitter', {
    schema:{
        destination: {type:'string'},
        cutscene: {type:'boolean',default:false}
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
        if(!this.el.sceneEl.is('vr-mode'))
            return;
        const {destination,cutscene}=this.data;
        const eventDetail = {
            origin:this.el.parentNode,
            destinationURL:destination,
            cutscene:cutscene
        }
        this.el.emit('clickNavigation',eventDetail,true)
    }
  });