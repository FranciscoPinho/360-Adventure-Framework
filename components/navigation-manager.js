AFRAME.registerComponent('navigation-manager', {
    schema:{
        dur: {type:'number', default: 500},
        initialEnv:{type:'string'}
    },
    init:  function () {
        this.setFadeInOrOut = this.setFadeInOrOut.bind(this)
        this.clickNavigationListener = this.clickNavigationListener.bind(this)
        this.onDestinationLoaded = this.onDestinationLoaded.bind(this)
        this.injectNewEnvironmentDOM = this.injectNewEnvironmentDOM.bind(this)
        if(this.data.initialEnv){
            this.setInitialEnvironment = this.setInitialEnvironment.bind(this)
            this.setInitialEnvironment()
        } 
    }, 
    play: function() {
        this.el.addEventListener('clickNavigation',this.clickNavigationListener)
    },
    pause: function() {
        this.el.removeEventListener('clickNavigation',this.clickNavigationListener)
    },
    clickNavigationListener: async function (evt) {
        evt.stopPropagation()
        const {origin,destinationURL} = evt.detail
        const {injectNewEnvironmentDOM} = this
        const response = await fetch(destinationURL)
        const env_json = await response.json()
        const scene = this.el
        let newEnvironment = jsonToEntity(env_json)
        origin.components.material.material.map.image.pause()
        this.setFadeInOrOut('out',origin) 
        origin.emit('set-image-fade-out')
        this.setFadeInOrOut('in',newEnvironment["parentNode"])
        setTimeout(function () {
            scene.removeChild(origin)
            injectNewEnvironmentDOM(scene,newEnvironment,false)
        }, this.data.dur)
    },
    injectNewEnvironmentDOM : function (scene,newEnvironment,initialEnv) {
        let destination = scene.appendChild(newEnvironment["parentNode"])
        if(newEnvironment["jsonChildren"] !== undefined){
            let queue = []
            queue.push(newEnvironment)
            while(queue.length>0){
                let parentNode = queue[queue.length-1]["parentNode"]
                let childNodes = childrenJsonToEntities(queue[queue.length-1]["jsonChildren"])
                queue.pop()
                for(let i=0,len=childNodes.length;i<len;i++){
                    let prospectParent = parentNode.appendChild(childNodes[i]["parentNode"])
                    if(childNodes[i]["jsonChildren"] !== undefined){
                        queue.push({
                            "parentNode": prospectParent,
                            "jsonChildren": childNodes[i]["jsonChildren"]
                        })
                    } 
                }
            }
        }
        if(!initialEnv)
            destination.addEventListener('loaded',this.onDestinationLoaded)
    },
    onDestinationLoaded: function (evt) {
        setTimeout(()=>{
            evt.srcElement.emit('set-image-fade-in')
            evt.srcElement.components.material.material.map.image.play()
            evt.srcElement.removeEventListener('loaded',this)
        },100)
    },
    setInitialEnvironment : async function () {
        const {initialEnv} = this.data
        const response = await fetch(initialEnv)
        const env_json = await response.json()
        const scene = this.el
        let newEnvironment = jsonToEntity(env_json)
        this.setFadeInOrOut('in',newEnvironment["parentNode"])
        this.injectNewEnvironmentDOM(scene,newEnvironment,true)
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
  })