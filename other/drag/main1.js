p3.ondragstart = function(e) {
  console.log('事件源p3开始拖动')
  //记录刚一拖动时，鼠标在飞机上的偏移量
  offsetX = e.offsetX
  offsetY = e.offsetY
}

p3.ondrag = function(e) {
  console.log('事件源p3拖动中')
  var x = e.pageX
  var y = e.pageY
  console.log(x + '-' + y)
  //drag事件最后一刻，无法读取鼠标的坐标，pageX和pageY都变为0
  if (x == 0 && y == 0) {
    return //不处理拖动最后一刻X和Y都为0的情形
  }
  x -= offsetX
  y -= offsetY

  p3.style.left = x + 'px'
  p3.style.top = y + 'px'
}

p3.ondragend = function() {
  console.log('源对象p3拖动结束')
}