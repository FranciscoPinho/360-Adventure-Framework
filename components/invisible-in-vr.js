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
        window.addEventListener('vrdisplayactivate', makeVisible);
        el.sceneEl.addEventListener('enter-vr', makeVisible);
        el.sceneEl.addEventListener('exit-vr', makeInvisible)
    },
    pause() {
        const {
            el,
            makeVisible,
            makeInvisible
        } = this
        el.sceneEl.removeEventListener('enter-vr', makeVisible);
        el.sceneEl.removeEventListener('exit-vr', makeInvisible)
        window.removeEventListener('vrdisplayactivate', makeVisible);
    },
    makeVisible() {
        this.el.setAttribute('visible', true)
    },
    makeInvisible() {
        this.el.setAttribute('visible', false)
    }
});