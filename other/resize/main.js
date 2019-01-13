"use strict";

// 最低可调整大小的区域
var minWidth = 60;
var minHeight = 40;

// 临界值值
var FULLSCREEN_MARGINS = -10; // 全屏 边缘
var MARGINS = 4; // 边缘

var clicked = null; // 配置点击对象。

// 边缘 Boolean
var onRightEdge, // 右侧边缘
    onBottomEdge, // 底部边缘
    onLeftEdge, // 左侧边缘
    onTopEdge; // 顶部边缘

var rightScreenEdge,
    bottomScreenEdge;

var preSnapped; // 放大 容器

var b, // 拖放 元素 边界 信息
    x, 
    y;

var redraw = false; // 重绘

var pane = document.getElementById('pane');
var ghostpane = document.getElementById('ghostpane');

// 设置 指定元素 偏移量 和 宽度
function setBounds(element, x, y, w, h) {
	element.style.left = x + 'px';
	element.style.top = y + 'px';
	element.style.width = w + 'px';
	element.style.height = h + 'px';
}

// 隐藏 幽灵层
function hintHide() {
  setBounds(ghostpane, b.left, b.top, b.width, b.height);
  ghostpane.style.opacity = 0;
}


// Mouse events
pane.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onUp);

// Touch events	
/*
pane.addEventListener('touchstart', onTouchDown);
document.addEventListener('touchmove', onTouchMove);
document.addEventListener('touchend', onTouchEnd);


function onTouchDown(e) {
  onDown(e.touches[0]);
  e.preventDefault();
}

function onTouchMove(e) {
  onMove(e.touches[0]);		
}

function onTouchEnd(e) {
  if (e.touches.length ==0) onUp(e.changedTouches[0]);
}
*/

// pane 鼠标按下，触发事件。
function onMouseDown(e) {
  // console.log('鼠标按下')
  onDown(e);
  e.preventDefault();
}

// 鼠标按下，激活事件。
function onDown(e) {
  calc(e);

  var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

  clicked = {
    x: x,
    y: y,
    cx: e.clientX,
    cy: e.clientY,
    w: b.width,
    h: b.height,
    isResizing: isResizing,
    isMoving: !isResizing && canMove(),
    onTopEdge: onTopEdge,
    onLeftEdge: onLeftEdge,
    onRightEdge: onRightEdge,
    onBottomEdge: onBottomEdge
  };
}

// 判断 是否 可移动
function canMove() {
  return x > 0 && x < b.width && y > 0 && y < b.height && y < 30;
}

// 鼠标 移动时 更新 全局部分状态 值
function calc(e) {
  b = pane.getBoundingClientRect();
  // console.log('getBoundingClientRect:', b)
  x = e.clientX - b.left;
  y = e.clientY - b.top;

  onTopEdge = y < MARGINS;
  onLeftEdge = x < MARGINS;
  onRightEdge = x >= b.width - MARGINS;
  onBottomEdge = y >= b.height - MARGINS;

  rightScreenEdge = window.innerWidth - MARGINS;
  bottomScreenEdge = window.innerHeight - MARGINS;
}

var e;

// document 鼠标，移动时间触发
function onMove(ee) {
  // console.log('文档上鼠标移动')
  calc(ee);

  e = ee;

  redraw = true;

}

function animate() {
  // console.log('动画执行')

  requestAnimationFrame(animate);

  if (!redraw) return;

  redraw = false;

  if (clicked && clicked.isResizing) { // 改变 大小

    if (clicked.onRightEdge) pane.style.width = Math.max(x, minWidth) + 'px';
    if (clicked.onBottomEdge) pane.style.height = Math.max(y, minHeight) + 'px';

    if (clicked.onLeftEdge) {
      var currentWidth = Math.max(clicked.cx - e.clientX  + clicked.w, minWidth);
      if (currentWidth > minWidth) {
        pane.style.width = currentWidth + 'px';
        pane.style.left = e.clientX + 'px';
      }
    }

    if (clicked.onTopEdge) {
      var currentHeight = Math.max(clicked.cy - e.clientY  + clicked.h, minHeight);
      if (currentHeight > minHeight) {
        pane.style.height = currentHeight + 'px';
        pane.style.top = e.clientY + 'px';	
      }
    }

    hintHide();

    return;
  }

  if (clicked && clicked.isMoving) { // 移动

    // 根据边界 情况 对 幽灵布 操作
    if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
      setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight);
      ghostpane.style.opacity = 0.2;
    } else if (b.top < MARGINS) {
      setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight / 2);
      ghostpane.style.opacity = 0.2;
    } else if (b.left < MARGINS) {
      setBounds(ghostpane, 0, 0, window.innerWidth / 2, window.innerHeight);
      ghostpane.style.opacity = 0.2;
    } else if (b.right > rightScreenEdge) {
      setBounds(ghostpane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
      ghostpane.style.opacity = 0.2;
    } else if (b.bottom > bottomScreenEdge) {
      setBounds(ghostpane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
      ghostpane.style.opacity = 0.2;
    } else {
      hintHide();
    }

    if (preSnapped) {
      setBounds(pane,
      	e.clientX - preSnapped.width / 2,
      	e.clientY - Math.min(clicked.y, preSnapped.height),
      	preSnapped.width,
      	preSnapped.height
      );
      return;
    }

    // moving
    pane.style.top = (e.clientY - clicked.y) + 'px';
    pane.style.left = (e.clientX - clicked.x) + 'px';

    return;
  }

  // 当鼠标移动而不单击时执行此代码

  // 鼠标 样式
  if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
    pane.style.cursor = 'nwse-resize';
  } else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
    pane.style.cursor = 'nesw-resize';
  } else if (onRightEdge || onLeftEdge) {
    pane.style.cursor = 'ew-resize';
  } else if (onBottomEdge || onTopEdge) {
    pane.style.cursor = 'ns-resize';
  } else if (canMove()) {
    pane.style.cursor = 'move';
  } else {
    pane.style.cursor = 'default';
  }
}

animate();

// document 鼠标 拿起
function onUp(e) {
  // console.log('文档上鼠标拿起')
  calc(e);
  
  // 如果是 移动 事件 清空
  if (clicked && clicked.isMoving) {
    // Snap
    var snapped = {
      width: b.width,
      height: b.height
    };

    // 如果 是边界 对 pane 进行 放大操作
    if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
      setBounds(pane, 0, 0, window.innerWidth, window.innerHeight);
      preSnapped = snapped;
    } else if (b.top < MARGINS) {
      setBounds(pane, 0, 0, window.innerWidth, window.innerHeight / 2);
      preSnapped = snapped;
    } else if (b.left < MARGINS) {
      setBounds(pane, 0, 0, window.innerWidth / 2, window.innerHeight);
      preSnapped = snapped;
    } else if (b.right > rightScreenEdge) {
      setBounds(pane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
      preSnapped = snapped;
    } else if (b.bottom > bottomScreenEdge) {
      setBounds(pane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
      preSnapped = snapped;
    } else {
      preSnapped = null;
    }
    hintHide();
  }

  clicked = null;

}
