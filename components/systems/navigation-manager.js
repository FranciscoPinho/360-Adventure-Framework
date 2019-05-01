AFRAME.registerComponent('navigation-manager', {
    schema:{
        dur: {type:'number', default: 1000},
        initialEnv:{type:'string'},
        menu:{type:'boolean',default:false},
        clearStorage:{type:'boolean',default:false}
    },
    init() {
        this.setFadeInOrOut = this.setFadeInOrOut.bind(this)
        this.clickNavigationListener = this.clickNavigationListener.bind(this)
        this.injectNewEnvironmentDOM = this.injectNewEnvironmentDOM.bind(this)
        this.appState = AFRAME.scenes[0].systems.state.state;
        if(this.data.clearStorage)
            localStorage.clear()
        if (performance.navigation.type == 1 || performance.navigation.type == 0) {
            AFRAME.scenes[0].emit('loadFromLocalStorage',{fromMenu:this.data.menu})
        }
    }, 
    play() {
        if(!this.data.menu){
            let loadedEnv = localStorage.getItem('activeBackgroundURL')
            if(loadedEnv){
                this.data.initialEnv = JSON.parse(loadedEnv)
            }
        }   
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
        const {injectNewEnvironmentDOM,appState} = this
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
            injectNewEnvironmentDOM(scene,newEnvironment,destinationURL)
        },this.data.dur)
    },
    injectNewEnvironmentDOM (scene,newEnvironment,destinationURL) {
        const {menu} = this.data
        const {appState} = this
        let backgroundSrc
        let destination = scene.appendChild(newEnvironment["parentNode"])
        let localStorageBackgroundSrc = localStorage.getItem("activeBackgroundSrc")
        if(localStorageBackgroundSrc && !menu){
            backgroundSrc = JSON.parse(localStorageBackgroundSrc)
            if(backgroundSrc.hasOwnProperty(destinationURL) ){
                newEnvironment["parentNode"].setAttribute('src',backgroundSrc[destinationURL])
                if(newEnvironment["parentNode"].getAttribute('video-player'))
                    newEnvironment["parentNode"].setAttribute('video-player',"")
            }
        }
        if(!menu)
            AFRAME.scenes[0].emit('updateActiveBackground', { activeBackgroundID:destination.id, activeBackgroundURL:destinationURL})
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
        appState.examinedObjects.forEach((obj)=>{
            let el = document.querySelector('#'+obj.elID)
            if(el)
                el.setAttribute('hoverable',{hoverIcon:obj.hoverIcon})
        })    
    },
    async setInitialEnvironment() {
        const {initialEnv,menu} = this.data
        const response = await fetch(initialEnv)
        const env_json = await response.json()
        const scene = this.el
        let newEnvironment = jsonToEntity(env_json)
        this.injectNewEnvironmentDOM(scene,newEnvironment,initialEnv)
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