AFRAME.registerComponent('scripted-invisibility', {
    schema: {
        initialVisibility:{type:"boolean", default:false},
        mediaHook:{type:"selector"},
        timestamp:{type:"number"},
        changeVisibilityTo:{type:"boolean"}
    },
    init() {
        this.forceVisibility = this.forceVisibility.bind(this);
        this.forceInvisibility = this.forceInvisibility.bind(this);
        let appState = AFRAME.scenes[0].systems.state.state

        if(appState.visibilityRecords[this.el.id])
            this.data.initialVisibility = true
        
        if(!this.data.initialVisibility)
            this.forceInvisibility()
        else this.forceVisibility()
        this.tick = AFRAME.utils.throttleTick(this.tick, this.data.timestamp ? 500:50000, this);
    },
    tick() {
        const {el} = this
        const {mediaHook,timestamp,changeVisibilityTo}=this.data
        if(mediaHook && timestamp){
            if(mediaHook.currentTime>=timestamp && el.getAttribute('visible')!==changeVisibilityTo){
                    changeVisibilityTo ? forceVisibility():forceInvisibility()
                    this.tick = AFRAME.utils.throttleTick(()=>{}, 50000, this);
            } 
        } 
    },
    play() {
        const {
            el,
            forceVisibility,
            forceInvisibility
        } = this
        el.addEventListener('force-invisibility',forceInvisibility)
        el.addEventListener('force-visibility',forceVisibility)
    },
    pause() {
        const {
            el,
            forceVisibility,
            forceInvisibility
        } = this
        el.removeEventListener('force-invisibility',forceInvisibility)
        el.removeEventListener('force-visibility',forceVisibility)
    },
    forceInvisibility(){
        const {el} = this
        if(el.classList.contains('inter'))
            el.classList.remove('inter')
        el.setAttribute('visible', false)
        AFRAME.scenes[0].emit('updateVisibilityRecords',{objectID:el.id,visibility:false})
    },
    forceVisibility(){
        const {el} = this
        if(!el.classList.contains('inter'))
            el.classList.add('inter')
        el.setAttribute('visible', true)
        AFRAME.scenes[0].emit('updateVisibilityRecords',{objectID:el.id,visibility:true})
    }
});