
const containerTypeUtils = ({ capacity, dropHeight, dropPerWellX, dropPerWellY, dropWidth, wellDrop, wellPerRow }) => {
  const containerDetails = {
    capacity,
    dropHeight,
    dropPerWellX,
    dropPerWellY,
    dropWidth,
    wellDrop,
    wellPerRow,
    width: 0,
    height: 0,
    offsetY: 0,
    offsetX: 0,
    wellPad: 0,
    dropPad: 0,
    wellWidth: 0,
    wellHeight: 0,
    dropWidthPx: 0,
    dropHeightPx: 0,
    dropOffsetX: 0,
    dropOffsetY: 0
  }
  
  const dropTotal = () =>  {
    return dropPerWellX * dropPerWellY - (wellDrop > -1 ? 1 : 0)
  }

  const wellTotal = () => {
    return capacity / dropTotal()
  }

  const getWell = (position) => {
    return Math.floor((parseInt(position)-1) / dropTotal())
  }

  const getName = (position) => {
    const p = getRowColDrop(position)
    return String.fromCharCode(p.row + 65) + (p.col + 1)
  }

  const getDrop = (position) => {
    return ((position - 1) % dropTotal()) + 1
  }

  const getRowColDrop = (position) => {
    const wellPosition = Math.floor((parseInt(position)-1) / dropTotal())
    const drop = getDrop(position)

    const col = wellPosition % wellPerRow
    const row = Math.floor(wellPosition / wellPerRow)

    return { row, col, drop, position }
  }

  const calculateParameters = () => {
    containerDetails.wellPad = containerDetails.width / 130
    containerDetails.dropPad = containerDetails.width / 130

    containerDetails.wellWidth = ((containerDetails.width - containerDetails.offsetX) / wellPerRow) - containerDetails.wellPad
    containerDetails.wellHeight = (containerDetails.height - containerDetails.offsetY) / (capacity / (wellPerRow * dropTotal())) - containerDetails.wellPad

    containerDetails.dropWidthPx = (containerDetails.wellWidth - containerDetails.dropPad * 2) / (dropPerWellX / dropWidth)
    containerDetails.dropHeightPx = (containerDetails.wellHeight - containerDetails.dropPad * 2) / (dropPerWellY / dropHeight)

    containerDetails.dropOffsetX = containerDetails.dropOffsetX * (containerDetails.wellWidth - containerDetails.dropPad * 2)
    containerDetails.dropOffsetY = containerDetails.dropOffsetY * (containerDetails.wellHeight - containerDetails.dropPad * 2)
  }

  const setGeometry = (width, height, offsetX, offsetY) => {
    containerDetails.width = width
    containerDetails.height = height
    containerDetails.offsetX = offsetX || 25
    containerDetails.offsetY = offsetY || 25

    calculateParameters()
  }

  return {
    setGeometry,
    getDrop,
    getRowColDrop,
    getName,
    getWell,
    wellTotal,
    ...containerDetails
  }
}

export default containerTypeUtils