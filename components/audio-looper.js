AFRAME.registerComponent('audio-looper', {
    schema : {
        loopBegin:{type:"number",default:1},
        loopEnd:{type:"number",default:-1},
    },
    init:  function () {
        var el = this.el;
        this.el.addEventListener('sound-ended', function (evt) { 
            if(evt.srcElement===el)
                if(el.getAttribute('visible'))
                    el.components.sound.playSound();
        })
    },

  });