AFRAME.registerComponent('invisible-in-vr', {
    init() {
        this.makeVisible = this.makeVisible.bind(this);
        this.makeInvisible = this.makeInvisible.bind(this);
    },
    play() {
        const {
            el,
            makeVisible,
            makeInvisible
        } = this
        window.addEventListener('vrdisplayactivate', makeInvisible);
        el.sceneEl.addEventListener('enter-vr', makeInvisible);
        el.sceneEl.addEventListener('exit-vr', makeVisible)
    },
    pause() {
        const {
            el,
            makeVisible,
            makeInvisible
        } = this
        el.sceneEl.removeEventListener('enter-vr', makeInvisible);
        el.sceneEl.removeEventListener('exit-vr', makeVisible)
        window.removeEventListener('vrdisplayactivate', makeInvisible);
    },
    makeVisible() {
        this.el.setAttribute('visible', true)
    },
    makeInvisible() {
        this.el.setAttribute('visible', false)
    }
});