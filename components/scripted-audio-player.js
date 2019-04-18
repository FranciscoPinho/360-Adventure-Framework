AFRAME.registerComponent('scripted-audio-player', {
    schema: {
      src:{type:"string"},
      autoplay:{type:"boolean",default:false},
      delaySeconds:{type:"number",default:0},
      startEvents:{type:"array",default:['triggerdown,click']},
      removeOnEnd:{type:"boolean",default:false},
      volume:{type:"number",default:1},
      exclusive:{type:"boolean",default:false},
      newFlag:{type:"string",default:"heard"},
      newURL:{type:"string"}
    },
    init() {
      const {src} = this.data
      this.resumeAudio = this.resumeAudio.bind(this);
      this.playAudio = this.playAudio.bind(this);
      this.stopAudio = this.stopAudio.bind(this);
      this.onSoundEnded = this.onSoundEnded.bind(this);
      this.pauseAudio = this.pauseAudio.bind(this)
      if(src.includes('#'))
        this.audio = document.querySelector(src)
      else {
        this.audio = document.createElement('audio')
        this.audio.id = this.data.audioElementID
        this.audio.src = src
        document.querySelector('a-assets').appendChild(this.audio)
      }
      this.appState = AFRAME.scenes[0].systems.state.state
      this.isPlayingAudio = false
    },
    play()  {
      const {el,playAudio,pauseAudio,audio,onSoundEnded,resumeAudio,stopAudio} = this
      const {autoplay,startEvents,volume,delaySeconds} = this.data
      audio.volume = volume

      if(!autoplay)
        for(let i=0,n=startEvents.length; i<n; i++)
          el.addEventListener(startEvents[i], playAudio)

      if(delaySeconds && !autoplay)
        console.error("DelaySeconds should be used with autoplay, unexpected behaviour may happen")

      audio.addEventListener('ended', onSoundEnded)
      
      if(el.sceneEl.is('vr-mode') && autoplay){
        if(delaySeconds)
          setTimeout(()=>playAudio("autoplay"),delaySeconds*1000)
        else playAudio("autoplay")
      }

      el.addEventListener('stop-audio',stopAudio)
      el.sceneEl.addEventListener('enter-vr', resumeAudio);
      el.sceneEl.addEventListener('exit-vr', pauseAudio)
    },
    pause()  {
      const {el,playAudio,pauseAudio,stopAudio,audio,onSoundEnded,resumeAudio} = this
      const {autoplay,startEvents} = this.data
      if(!autoplay)
        for(let i=0,n=startEvents.length; i<n; i++)
          el.removeEventListener(startEvents[i], playAudio)

      if(audio)
        audio.removeEventListener('ended', onSoundEnded)

      el.removeEventListener('stop-audio',stopAudio)
      el.sceneEl.removeEventListener('enter-vr', resumeAudio);
      el.sceneEl.removeEventListener('exit-vr', pauseAudio)
    },
    resumeAudio()  {  
        const {audio,isPlayingAudio,resumeAudio,playAudio} = this
        const {delaySeconds,autoplay} = this.data
        if(isPlayingAudio)
          audio.play()
        else {
          if(autoplay)
            if(delaySeconds)
              setTimeout(()=>playAudio("autoplay"),delaySeconds*1000)
            else playAudio("autoplay")
        }
    },
    playAudio(evt){
      const {audio,appState,el,playAudio} = this
      const {src,exclusive} = this.data
      if(appState.exclusiveAudioPlaying)
        return
      if(evt.type==="triggerdown" || evt.type==="click"){
        if(appState.dialogueOn || appState.inventoryOpen || appState.cutscenePlaying)
          return
      }
      if(el.sceneEl.is('vr-mode')){  
        const {audio} = this
        audio.currentTime=0
        this.isPlayingAudio=true
        AFRAME.scenes[0].emit('addAudioPlaying',{audio:{audioID:src,elementID:el.getAttribute('id')},exclusive:exclusive})
        audio.play() 
      }
    },
    pauseAudio() {
      this.audio.pause()
    },
    stopAudio() {
      const {exclusive,autoplay,removeOnEnd} = this.data
      const {audio,el,onSoundEnded}=this
      if(exclusive || !audio)
        return
      audio.pause()
      audio.currentTime = 0
      this.isPlayingAudio=false
      if(autoplay && removeOnEnd){
        audio.removeEventListener('ended',onSoundEnded)
        audio.parentNode.removeChild(audio)
        el.removeAttribute('scripted-audio-player')
      }
    },
    onSoundEnded(){
      const {el,audio,onSoundEnded} = this
      const {exclusive,removeOnEnd,newFlag,newURL} = this.data
      this.isPlayingAudio=false
      AFRAME.scenes[0].emit('addFlag',{flagKey:audio.id,flagValue:newFlag})
      AFRAME.scenes[0].emit('removeAudioPlaying',{audioID:audio.id,exclusive:exclusive})
      if(removeOnEnd){
        audio.removeEventListener('ended',onSoundEnded)
        audio.parentNode.removeChild(audio)
        el.removeAttribute('scripted-audio-player')
      }
      if(newURL){
        AFRAME.scenes[0].emit('changeURL',{url:newURL})
        return
      }
    }
  });