AFRAME.registerComponent('navigation', {
    schema:{
        origin: {type:'selector'},
        destination: {type:'selector'},
        dur: {type:'number', default: 500}
    },
    init:  function () {
        this.setFadeInOrOut = this.setFadeInOrOut.bind(this);
        var data = this.data;
        var origin = data.origin;
        var destination = data.destination;

        this.setFadeInOrOut('out',origin);
        this.setFadeInOrOut('in',destination);
        this.el.addEventListener('click', function () {
            // Fade out image.
            console.log(origin.components.material.material.map.image)
            origin.components.material.material.map.image.pause();
            origin.emit('set-image-fade-out');
            // Wait for fade to complete.
            setTimeout(function () {
            // Set image.
            origin.setAttribute('visible',false)
            destination.components.material.material.map.image.play();
            destination.setAttribute('visible',true)
            destination.emit('set-image-fade-in');
            }, data.dur);
        });
       
    },

    /**
     * Setup fade-in + fade-out.
     */
    setFadeInOrOut: function (direction,targetEl) {
        // Only set up once.
        if(direction==="in"){
            if (targetEl.dataset.setImageFadeInSetup) { return; }
            targetEl.dataset.setImageFadeInSetup = true;
        }
        else{
            if (targetEl.dataset.setImageFadeOutSetup) { return; }
            targetEl.dataset.setImageFadeOutSetup = true;
        }
   
        // Create animation.
        targetEl.setAttribute('animation__fade'+'__'+direction, {
        property: 'material.color',
        startEvents: 'set-image-fade-'+direction,
        dir: direction==='out'?'normal':'reverse',
        dur: this.data.dur,
        from: '#FFF',
        to: '#000'
        });
    },

  });