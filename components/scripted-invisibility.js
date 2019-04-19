AFRAME.registerComponent('scripted-invisibility', {
    schema: {
        initialVisibility:{type:"boolean", default:false}
    },
    init() {
        this.forceVisibility = this.forceVisibility.bind(this);
        this.forceInvisibility = this.forceInvisibility.bind(this);
        let appState = AFRAME.scenes[0].systems.state.state
        if(appState.visibilityRecords[this.el.getAttribute('id')])
            this.data.initialVisibility = true
        else this.data.initialVisibility = false

        if(!this.data.initialVisibility)
            this.forceInvisibility()
        else this.forceVisibility()
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
        AFRAME.scenes[0].emit('updateVisibilityRecords',{objectID:el.getAttribute('id'),visibility:false})
    },
    forceVisibility(){
        const {el} = this
        if(!el.classList.contains('inter'))
            el.classList.add('inter')
        el.setAttribute('visible', true)
        AFRAME.scenes[0].emit('updateVisibilityRecords',{objectID:el.getAttribute('id'),visibility:true})
    }
});