AFRAME.registerComponent('pickable', {
    schema: {
        icon:{type:"string"}
    },
    init:  function () {  
        this.pickObject = this.pickObject.bind(this)
    },
    play: function() {
        this.el.addEventListener('click',this.pickObject)
    },
    pause: function() {
        this.el.removeEventListener('click',this.pickObject)
    },
    pickObject: function () {
        if(!this.el.sceneEl.is('vr-mode'))
            return;
        let object = {
            id:this.el.getAttribute('id'),
            icon:this.data.icon
        }
        AFRAME.scenes[0].emit('addToInventory', {object: object});
        this.el.parentNode.removeChild(this.el);
    }
});