define([], function() {
  function Drag(){}
  Drag.prototype.init = function(el, parent){
    var pel = parent || window;
    el.onmousedown = function(e){
      var e = e || window.event;
      var diffX = e.clientX - el.offsetLeft;
      var diffY = e.clientY - el.offsetTop;
      console.log('diffX:' + diffX);
      console.log('diffY:' + diffY);
      // 捕获鼠标移动到浏览器外部也可以捕获事件
      if(typeof el.setCapture != 'undefined'){
        el.setCapture();
      }
      document.onmousemove = function(e){
        var e = e || window.event;
        var left = e.clientX - diffX;
        var top = e.clientY - diffY;
        console.log('left:' + left);
        console.log('top:' + top);
        // 控制范围 不允许拖到浏览器外
        var parentWidth = '';
        if(parent){
          parentWidth = parent.clientWidth;
          parentHeight = parent.clientHeight;
        }else{
          parentWidth = window.innerWidth
          parentHeight = window.innerHeight;
        }
        if(left < 0){
          left = 0;
        }else if(left > parentWidth - el.offsetWidth){
          left = parentWidth - el.offsetWidth;
        }
        if( top < 0){
          top = 0;
        } else if ( top > parentHeight - el.offsetHeight){
          top = parentHeight - el.offsetHeight;
        }
        el.style.left = left + 'px';
        el.style.top = top + 'px';
      }
      document.onmouseup = function(e){
        this.onmousemove = null;
        this.onmouseup = null;
        if(typeof el.setCapture != 'undefined'){
          el.setCapture();
        }
      }
    }
  }
  
  return {
    drag: Drag
  }
});