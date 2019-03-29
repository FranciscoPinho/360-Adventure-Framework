AFRAME.registerComponent('hoverable', {
    schema: {
        hoverIcon:{type:"string" , default:""},
        scaleFactor:{type:"number", default:1.05},
        sfxSrc:{type:"string",default:""},
        volume:{type:"number",default:1}
    },
    init:  function () {  
        console.log("INIT HOVERING ON ELEMENT ",this.el)
        this.onHoverObject = this.onHoverObject.bind(this)
        this.onLeaveObject = this.onLeaveObject.bind(this)
        this.onIntersect = this.onIntersect.bind(this)
        this.onLeaveObject = this.onLeaveObject.bind(this)
        this.originScaling = this.el.getAttribute('scale')
        if(this.data.sfxSrc){
            this.sfxSrc = document.querySelector(this.data.sfxSrc)
            this.sfxSrc.volume = this.data.volume
        }
    },
    play: function() {
        if(this.data.hoverIcon){
            this.pointer = document.createElement('a-image')
            this.pointer.setAttribute('src',this.data.hoverIcon)
            this.el.addEventListener('raycaster-intersected',this.onIntersect);
            this.el.addEventListener('raycaster-intersected-cleared',this.onLoseIntersection);
            this.el.sceneEl.appendChild(this.pointer)
        }
        this.el.addEventListener('mouseenter',this.onHoverObject)
        this.el.addEventListener('mouseleave',this.onLeaveObject)
    },
    pause: function() {
        if(this.data.hoverIcon){
            this.el.removeEventListener('raycaster-intersected',this.onIntersect);
            this.el.removeEventListener('raycaster-intersected-cleared',this.onLoseIntersection);
            this.el.sceneEl.removeChild(this.pointer)
        }
        this.el.removeEventListener('mouseenter',this.onHoverObject)
        this.el.removeEventListener('mouseleave',this.onLeaveObject)
    },
    tick: function () {
        if (!this.raycaster) { return; }
        let intersection = this.raycaster.components.raycaster.getIntersection(this.el);
        if (!intersection) { return; }
        this.pointer.setAttribute('position',{
            x: intersection.point.x+0.2,
            y: intersection.point.y,
            z: intersection.point.z
        })
    },
    onIntersect : function (evt) {
        this.raycaster = evt.detail.el;
    },
    onLoseIntersection : function (evt) {
        this.raycaster = null;
    },
    onHoverObject: function () {
        if(!this.el.sceneEl.is('vr-mode'))
            return
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen && !this.el.classList.contains('invObject')) 
            return
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
        if(this.data.hoverIcon)
            this.pointer.setAttribute('visible',true)
        if(!this.el.classList.contains('invObject'))
            AFRAME.scenes[0].emit('updateHoveringObject', {hoveringObject: true})
    },
    onLeaveObject: function () {
        if(!this.el.sceneEl.is('vr-mode'))
           return;
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen && !this.el.classList.contains('invObject')) 
            return
        let scale = this.originScaling
        const {scaleFactor} = this.data
        let newScaling =  {
            x: scale.x/scaleFactor,
            y: scale.y/scaleFactor,
            z: scale.z/scaleFactor
        }
        this.el.setAttribute('scale',newScaling)
        if(this.data.hoverIcon)
            this.pointer.setAttribute('visible',false)
        if(!this.el.classList.contains('invObject'))
            AFRAME.scenes[0].emit('updateHoveringObject', {hoveringObject: false})
    }
});