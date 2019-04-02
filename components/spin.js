//credit to https://github.com/supermedium/aframe-super-hot-loader/blob/master/example/src/components/spin.js
AFRAME.registerComponent('spin', {
    init: function () {
      this.originalRotation = this.el.object3D.rotation.y;
    },
  
    remove: function () {
      this.el.object3D.rotation.y = this.originalRotation;
    },
  
    tick: function () {
      this.el.object3D.rotation.y += 0.05;
    }
});