AFRAME.registerComponent('hoverable', {
    schema: {
        hoverIcon:{type:"string" , default:""},
        scaleFactor:{type:"number", default:1.05},
        sfxSrc:{type:"string",default:""},
        volume:{type:"number",default:1}
    },
    init:  function () {  
        this.onHoverObject = this.onHoverObject.bind(this)
        this.onLeaveObject = this.onLeaveObject.bind(this)
        this.originScaling = this.el.getAttribute('scale')
        this.sfxSrc = document.querySelector(this.data.sfxSrc)
        this.sfxSrc.volume = this.data.volume
    },
    play: function() {
        this.el.addEventListener('mouseenter',this.onHoverObject)
        this.el.addEventListener('mouseleave',this.onLeaveObject)
    },
    pause: function() {
        this.el.removeEventListener('mouseenter',this.onHoverObject)
        this.el.removeEventListener('mouseleave',this.onLeaveObject)
    },
    onHoverObject: function () {
        if(!this.el.sceneEl.is('vr-mode'))
            return;
        let scale = this.originScaling
        const {scaleFactor} = this.data
        let newScaling =  {
            x: scale.x*scaleFactor,
            y: scale.y*scaleFactor,
            z: scale.z*scaleFactor
        }
        if(this.sfxSrc)
            this.sfxSrc.play()
        this.el.setAttribute('scale',newScaling)
    },
    onLeaveObject: function () {
        if(!this.el.sceneEl.is('vr-mode'))
            return;
        let scale = this.originScaling
        const {scaleFactor} = this.data
        let newScaling =  {
            x: scale.x/scaleFactor,
            y: scale.y/scaleFactor,
            z: scale.z/scaleFactor
        }
        this.el.setAttribute('scale',newScaling)
    }
});