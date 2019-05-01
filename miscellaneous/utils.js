createBasicPlane = (xDim,yDim,id) => {
    let plane = document.createElement("a-plane")
    plane.setAttribute("id", id)
    plane.setAttribute("geometry", { primitive: "plane" })
    plane.setAttribute("width", xDim)
    plane.setAttribute("height", yDim)
    return plane
}

