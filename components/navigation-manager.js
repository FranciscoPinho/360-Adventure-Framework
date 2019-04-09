AFRAME.registerComponent('navigation-manager', {
    schema:{
        dur: {type:'number', default: 1000},
        initialEnv:{type:'string'}
    },
    init() {
        this.setFadeInOrOut = this.setFadeInOrOut.bind(this)
        this.clickNavigationListener = this.clickNavigationListener.bind(this)
        this.injectNewEnvironmentDOM = this.injectNewEnvironmentDOM.bind(this)
    }, 
    play() {
        if(this.data.initialEnv){
            this.setInitialEnvironment = this.setInitialEnvironment.bind(this)
            this.setInitialEnvironment()
        } 
        this.el.addEventListener('clickNavigation',this.clickNavigationListener)
    },
    pause() {
        this.el.removeEventListener('clickNavigation',this.clickNavigationListener)
    },
    async clickNavigationListener (evt) {
        evt.stopPropagation()
        const {origin,destinationURL} = evt.detail
        const {injectNewEnvironmentDOM} = this
        const response = await fetch(destinationURL)
        const env_json = await response.json()
        const scene = this.el
        let newEnvironment = jsonToEntity(env_json)
        document.querySelector(origin.getAttribute('src')).pause()
        this.setFadeInOrOut('out',origin) 
        origin.emit('set-image-fade-out')
        document.querySelectorAll('.pointer').forEach((pointer)=>{
            scene.removeChild(pointer)
        })
        setTimeout(()=>{
            scene.removeChild(origin)
            injectNewEnvironmentDOM(scene,newEnvironment,false)
        },this.data.dur)
    },
    injectNewEnvironmentDOM (scene,newEnvironment) {
        let appState = AFRAME.scenes[0].systems.state.state;
        let destination = scene.appendChild(newEnvironment["parentNode"])
        this.setFadeInOrOut('in',destination)
        if(newEnvironment["jsonChildren"] !== undefined){
            let queue = []
            queue.push(newEnvironment)
            while(queue.length>0){
                let parentNode = queue[queue.length-1]["parentNode"]
                let childNodes = childrenJsonToEntities(queue[queue.length-1]["jsonChildren"])
                queue.pop()
                for(let i=0,len=childNodes.length;i<len;i++){
                    if(appState.pickedObjectIDs.indexOf(childNodes[i]["parentNode"].id)>-1)
                        continue
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
    },
    async setInitialEnvironment() {
        const {initialEnv} = this.data
        const response = await fetch(initialEnv)
        const env_json = await response.json()
        const scene = this.el
        let newEnvironment = jsonToEntity(env_json)
        this.injectNewEnvironmentDOM(scene,newEnvironment)
    },
    setFadeInOrOut(direction,targetEl) {
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