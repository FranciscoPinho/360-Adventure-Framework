AFRAME.registerComponent('menu-button', {
    schema:{
        buttonFunction: {type:'string'},
        level1URL:{type:'string'}
    },
    init() {  
        this.onClick = this.onClick.bind(this)
    },
    play() {
        const {el,onClick} = this
        const {buttonFunction} = this.data
      
        el.addEventListener('click',onClick)
        if(!localStorage.getItem('activeLevelURL')){
            if(buttonFunction==="load"){
                el.parentNode.removeChild(el)
                let loadtext = document.querySelector("#loadgametext")
                loadtext.parentNode.removeChild(loadtext)
            }
        }
    },
    pause() {
        const {el,onClick} = this
        el.removeEventListener('click',onClick)
    },
    onClick() {
        const {el} = this
        const {buttonFunction,level1URL} = this.data
        if(!el.sceneEl.is('vr-mode'))
            return;
       
        switch(buttonFunction){
            case "newgame":
                localStorage.clear()
                localStorage.setItem('activeLevelURL',JSON.stringify(level1URL))
                window.location.replace(level1URL)
                break
            case "load":
                let location = localStorage.getItem('activeLevelURL')
                window.location.replace(JSON.parse(location))
                break
        }
    }
  });