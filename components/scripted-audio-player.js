AFRAME.registerComponent('scripted-audio-player', {
    schema: {
      src:{type:"string"},
      autoplay:{type:"boolean",default:false},
      startEvents:{type:"array",default:['triggerdown,click']},
      removeOnEnd:{type:"boolean",default:false},
      volume:{type:"number",default:1},
      exclusive:{type:"boolean",default:false},
      newFlag:{type:"string",default:"heard"},
      newURL:{type:"string"}
    },
    init() {
      this.resumeAudio = this.resumeAudio.bind(this);
      this.playAudio = this.playAudio.bind(this);
      this.stopAudio = this.stopAudio.bind(this);
      this.onSoundEnded = this.onSoundEnded.bind(this);
      this.pauseAudio = this.pauseAudio.bind(this)
      this.audio = document.querySelector(this.data.src)
      this.appState = AFRAME.scenes[0].systems.state.state
      this.isPlaying = false
    },
    play()  {
      const {el,playAudio,pauseAudio,audio,onSoundEnded,resumeAudio} = this
      const {autoplay,startEvents,volume} = this.data
      audio.volume = volume

      if(!autoplay)
        for(let i=0,n=startEvents.length; i<n; i++)
          el.addEventListener(startEvents[i], playAudio)
    
      audio.addEventListener('ended', onSoundEnded)
      
      if(el.sceneEl.is('vr-mode') && autoplay)
        playAudio()

      el.addEventListener('stop-audio',stopAudio)
      el.sceneEl.addEventListener('enter-vr', resumeAudio);
      el.sceneEl.addEventListener('exit-vr', pauseAudio)
    },
    onSoundEnded(){
      const {el,audio,onSoundEnded} = this
      const {src,exclusive,removeOnEnd} = this.data
      this.isPlaying=false
      AFRAME.scenes[0].emit('addFlag',{flagKey:src,flagValue:newFlag})
      AFRAME.scenes[0].emit('removeAudioPlaying',{audioID:src,exclusive:exclusive})
      if(removeOnEnd){
        audio.removeEventListener('ended',onSoundEnded)
        el.removeAttribute('scripted-audio-player')
      }
      if(newURL){
        AFRAME.scenes[0].emit('changeURL',{url:newURL})
        return
      }
    },
    pause()  {
      const {el,playAudio,pauseAudio} = this
      const {autoplay,startEvents} = this.data
      if(!autoplay)
        for(let i=0,n=startEvents.length; i<n; i++)
          el.removeEventListener(startEvents[i], playAudio)


      audio.removeEventListener('ended', onSoundEnded)

      el.removeEventListener('stop-audio',stopAudio)
      el.sceneEl.removeEventListener('enter-vr', resumeAudio);
      el.sceneEl.removeEventListener('exit-vr', pauseAudio)
    },
    resumeAudio()  {
        const {audio,playAudio,isPlaying} = this
        if(isPlaying)
          audio.readyState === 4 ? audio.play() : setTimeout(resumeAudio,50)
    },
    playAudio(evt){
      const {audio,appState,el} = this
      const {src,exclusive} = this.data
      if(appState.exclusiveAudioPlaying)
        return
      if(evt.type==="triggerdown" || evt.type==="click"){
        if(appState.dialogueOn || appState.inventoryOpen || appState.cutscenePlaying)
          return
      }
      if(el.sceneEl.is('vr-mode')){  
        this.isPlaying=true
        AFRAME.scenes[0].emit('addAudioPlaying',{audio:{audioID:src,elementID:el.getAttribute('id')},exclusive:exclusive})
        const {audio} = this
        audio.currentTime=0
        audio.readyState === 4 ? audio.play() : setTimeout(playAudio,50)
      }
    },
    pauseAudio() {
      this.audio.pause()
    },
    stopAudio() {
      if(this.data.exclusive)
        return
      this.audio.pause()
      this.audio.currentTime = 0
      this.isPlaying=false
    }
  });