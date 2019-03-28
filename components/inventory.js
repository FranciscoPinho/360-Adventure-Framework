AFRAME.registerComponent('inventory', {
    schema: {
        
    },
    init:  function () {  
        this.summonInventory = this.summonInventory.bind(this)
    },
    play: function() {
        this.el.addEventListener('click',this.summonInventory)
    },
    pause: function() {
        this.el.removeEventListener('click',this.summonInventory)
    },
    summonInventory: function () {
        
    }
});