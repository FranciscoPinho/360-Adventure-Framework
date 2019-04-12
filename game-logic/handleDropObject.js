tryCombine = (grabbed, dropped) => {
    if (!dropped.classList.contains('invObject'))
        return false
    let appState = AFRAME.scenes[0].systems.state.state
    let grabbedID = grabbed.getAttribute('id')
    let droppedID = dropped.getAttribute('id')
    let grabbedSrc = grabbed.getAttribute('src')
    let droppedSrc = dropped.getAttribute('src')
    for (let i = 0, n = appState.combinations.length; i < n; i++) {
        let combination = appState.combinations[i]
        if (combination.mix.indexOf(grabbedID) !== -1 &&
            combination.mix.indexOf(droppedID) !== -1 &&
            grabbedID!=droppedID) {

            if(combination.result.sfxSrc){
                let audio = document.querySelector(combination.result.sfxSrc)
                if(combination.result.volume)
                    audio.volume = combination.result.volume
                audio.play()
            }
            AFRAME.scenes[0].emit('removeFromInventory', {
                object: {
                    iconID: grabbedID,
                    iconSrc: grabbedSrc
                }
            })
            AFRAME.scenes[0].emit('removeFromInventory', {
                object: {
                    iconID: droppedID,
                    iconSrc: droppedSrc
                }
            })
            AFRAME.scenes[0].emit('addToInventory', {
                object: {
                    iconID: combination.result.iconID,
                    iconSrc: combination.result.iconSrc,
                    iconDesc: combination.result.iconDesc
                }
            })
            AFRAME.scenes[0].emit('inventoryRefresh')
            return true
        }
    }
    return false

},
sendUseEvent = (grabbed,target) => {
    if (target.classList.contains('invObject'))
        return false
    target.emit('stimulus',{usedObject:grabbed.getAttribute('id')})
}
