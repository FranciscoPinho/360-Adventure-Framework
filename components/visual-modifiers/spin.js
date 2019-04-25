//credit to https://github.com/supermedium/aframe-super-hot-loader/blob/master/example/src/components/spin.js
AFRAME.registerComponent('spin', {
    init() {
      this.originalRotation = this.el.object3D.rotation.y;
    },
  
    remove() {
      this.el.object3D.rotation.y = this.originalRotation;
    },
  
    tick() {
      this.el.object3D.rotation.y += 0.05;
    }
});