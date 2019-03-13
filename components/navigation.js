AFRAME.registerComponent('navigation', {
    schema:{
        origin: {type:'selector'},
        destination: {type:'selector'},
        destinationSilent: {type:'boolean', default: false},
        dur: {type:'number', default: 500}
    },
    init:  function () {
        this.setFadeInOrOut = this.setFadeInOrOut.bind(this)
        this.clickNavigation = this.clickNavigation.bind(this)
        this.onHover = this.onHover.bind(this)
        const {origin,destination,destinationSilent} = this.data       
        this.setFadeInOrOut('out',origin)
        this.setFadeInOrOut('in',destination)
    },
    play: function() {
        this.el.addEventListener('click',this.clickNavigation)
        this.el.addEventListener('mouseenter',this.onHover)
    },
    pause: function() {
        this.el.removeEventListener('click',this.clickNavigation)
        this.el.removeEventListener('mouseenter',this.onHover)
    },
    clickNavigation: function () {
        const {origin,destination,destinationSilent,dur} = this.data 
        //pause current media
        origin.components.material.material.map.image.pause()
        let originMusic = origin.components.sound
        let destinationMusic = destination.components.sound
        let sceneMusic = origin.sceneEl.components.sound
        if(originMusic)
            originMusic.pauseSound()
        if(sceneMusic && destinationMusic)
            sceneMusic.pauseSound()
        if(destinationSilent)
            sceneMusic.pauseSound()
        // Fade out image.
        origin.emit('set-image-fade-out')
        // Wait for fade to complete.
        setTimeout(function () {
            origin.setAttribute('visible',false)
            destination.setAttribute('visible',true)
            destination.emit('set-image-fade-in')
            destination.components.material.material.map.image.play()
            //play any on begin scene clips here
            if(destinationSilent)
                return
            if(destinationMusic)
                destinationMusic.playSound()
            else if(sceneMusic)
                sceneMusic.playSound()
        }, dur)
    },
    onHover: function(){
        console.log("hovering")
    },
    setFadeInOrOut: function (direction,targetEl) {
        // Only set up once.
        if(direction==="in"){
            if (targetEl.dataset.setImageFadeInSetup) { return }
            targetEl.dataset.setImageFadeInSetup = true
        }
        else{
            if (targetEl.dataset.setImageFadeOutSetup) { return }
            targetEl.dataset.setImageFadeOutSetup = true
        }
        // Create animation.
        targetEl.setAttribute('animation__fade'+'__'+direction, {
        property: 'material.color',
        startEvents: 'set-image-fade-'+direction,
        dir: direction==='out'?'normal':'reverse',
        dur: this.data.dur,
        from: '#FFF',
        to: '#000'
        })
    },

  });