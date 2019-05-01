AFRAME.registerComponent('keyframes', {
    schema:{
        frames:{type:"array"}
    },
    init() {
      this.appState = AFRAME.scenes[0].systems.state.state
      let backgroundVideoElement = document.querySelector(`#${this.appState.activeBackgroundID}`)
      if(!backgroundVideoElement.getAttribute('video-player') || !this.data.frames)
        this.el.removeAttribute('keyframes')
      this.backgroundVideo = document.querySelector(backgroundVideoElement.getAttribute('src'))
      this.animateOverTime = this.animateOverTime.bind(this)
      this.emitEnterVR = this.emitEnterVR.bind(this)
      this.emitExitVR = this.emitExitVR.bind(this)
      this.originalPosition = new THREE.Vector3()
      this.originalRotation = new THREE.Vector3()
      this.originalScale = new THREE.Vector3()
      const {el, originalPosition, originalRotation, originalScale}=this
      originalPosition.copy(el.object3D.position)
      originalScale.copy(el.object3D.scale)
      originalRotation.copy(el.object3D.rotation)
      this.toDoFrames = [...this.data.frames]
      if(backgroundVideoElement.getAttribute('video-looper')){
        el.sceneEl.addEventListener('looped-video', ()=>{
            el.object3D.position.copy(originalPosition)
            el.object3D.scale.copy(originalScale)
            el.object3D.rotation.copy(originalRotation)
            this.toDoFrames = [...this.data.frames]
        })
      }
    },
    play() {
        const {
            el,
            emitExitVR,
            emitEnterVR
        } = this
        el.sceneEl.addEventListener('enter-vr', emitEnterVR)
        el.sceneEl.addEventListener('exit-vr', emitExitVR)
    },
    pause() {
        const {
            el,
            emitExitVR,
            emitEnterVR
        } = this
        el.sceneEl.removeEventListener('enter-vr', emitEnterVR)
        el.sceneEl.removeEventListener('exit-vr', emitExitVR)
    },
    emitEnterVR(){
        this.el.emit('enter-vr', null, false);
    },
    emitExitVR(){
        this.el.emit('exit-vr', null, false);
    },
    tick() {
      const {el,backgroundVideo,animateOverTime,toDoFrames} = this
      if(!el.sceneEl.is('vr-mode') || !toDoFrames.length)
        return
      let keyframe = toDoFrames[0]

      if(backgroundVideo.currentTime>=keyframe.fromTimestamp){
        let toTimestamp = keyframe.toTimestamp ? keyframe.toTimestamp : backgroundVideo.duration-0.1
        let duration = toTimestamp-keyframe.fromTimestamp
        animateOverTime(keyframe.type,duration,keyframe.target)
        toDoFrames.splice(0,1)
      }
    },
    animateOverTime(type,dur,target){
        const {el} = this
        el.setAttribute(`animation__${type}__keyframes`, {
            property: type,
            autoplay:true,
            pauseEvents: 'exit-vr',
            resumeEvents: 'enter-vr',
            dur: dur*1000,
            from: el.getAttribute(type),
            to: target
        })
    }
});