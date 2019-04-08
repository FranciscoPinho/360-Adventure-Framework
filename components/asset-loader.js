AFRAME.registerComponent('asset-loader', {
    init() {
        let queryResults = document.querySelectorAll('video')
        queryResults.forEach((video)=>{
            video.load()
        })
        queryResults = document.querySelectorAll('audio')
        queryResults.forEach((audio)=>{
            audio.load()
        })
    }
})