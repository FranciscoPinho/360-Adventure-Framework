AFRAME.registerComponent('audio-looper', {
    schema : {
        loopBegin:{type:"number",default:1},
        loopEnd:{type:"number",default:-1},
    },
    init : function () {
        this.onSoundEnded = this.onSoundEnded.bind(this)
    },
    play : function () {
        this.el.addEventListener('sound-ended', this.onSoundEnded)
    },
    pause: function () {
        this.el.removeEventListener('sound-ended', this.onSoundEnded)
    },
    onSoundEnded: function (evt) { 
        if(evt.srcElement===this.el)
            if(this.el.getAttribute('visible'))
                this.el.components.sound.playSound();
    }

  });