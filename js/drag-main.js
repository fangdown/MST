require.config({
  paths: {
    'drag': './drag'
  }
})
require(['drag'],function(Drag){
  var parent = document.getElementById('parent');
  var el = document.getElementById('drag');
  var drag = new Drag.drag;
	drag.init(el, parent);
})