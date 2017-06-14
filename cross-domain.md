## 一、为什么会出现跨域问题
> 浏览器的同源政策，出于防范跨站脚本的攻击，禁止客户端脚本（如JavaScript）对不同域的服务进行调用  
解释：不同域 ===！（协议 （http或https）+ 主机（host）+ 端口(port) ），服务：可以是各种url（非js）

## 二、跨域的方式及其原理
> 1，CORS:Cross-Origin Resource Sharing跨域资源共享

> 原理：CORS的基本原理是通过设置HTTP请求和返回中Header,告知浏览器该请求是合法的。
关键代码（express为例）
```javascript
// 设置跨域cors
app.all('*', function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', '3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
})
```

>2，jsonp：json with padding
> 原理：利用script标签元素不受浏览器同源策略的影响，可以加载异域服务器上的脚本,网页可以从其他来源动态产生json资料。jsonp获取的不是json数据，而是可以直接运行的JavaScript语句。

> 实现：出于jsonp的实现方式，通过url访问，所以只能是get方式。  
a，定义回调函数，即接受数据的方法；  
b，动态生成script元素，设定src为目标url（以前认为script的src是js文件，其实是可以是任意的服务，一般可以是jsp、php、restful,能返回相应数据的）  
c，服务端接受callback参数名，并将数据组装到该callback中返回   
```javascript 
// 客户端
  // js原生写法
  function getData(data){
    console.log(data);
  }
  var script = document.createElement('script');
  script.src = 'http://localhost:3005/users?callback=getData';
  document.body.appendChild(script);
  // ajax写法
    $.ajax({
      url: 'http://localhost:3005/users',
      jsonp: 'callback',
      dataType: 'jsonp',
      success: function(response){
        console.log('msg:'+ response.msg)
      },
      error: function(xhr){
        console.log('error')
      }
    })
    //有一点区别：原生写法返回的是json字符串，而ajax中的返回的是经过转换过的json
// 服务端
router.get('/', function(req, res, next) {
  var callback = req.query.callback;
  var data = {
    'msg': true,
    'data': 'hello resource'
  }
  console.log(callback);
  res.send(callback + '(' + JSON.stringify(data) + ')');
});
```
3,window.name 
> 原理：window对象都有一个name属性，该属性有个特征，即在一个窗口的生命周期内,窗口载入的所有页面都共享一个window.name属性。每个页面都有对window.name具有读写的权限。
注意：parent页面里创建一个iframe，同在一个页面，但是是两个不同的窗口，这点需牢记
实现逻辑：
a，parent.html页面（父页面） 创建一个iframe，并设置异域的url，可以在url中拼接参数;
b，data.html（数据封装页面），接受参数，并组装数据，赋值给window.name；
c，parent.html 监听iframe加载完成后，更改该iframe的url，指向和parent.html同域的空白页面，此时iframe窗口依然还是之前的窗口，window.name值未变。为什么这么做呢，父页面不能直接获取该iframe的值吗，答案是不能，parent.html和data.html是不同域的，无法通过iframe.contentWindow.name方法获取数据，会报错。但是把iframe的url改成和父页面同域的proxy.html后，就可以通过iframe.contentWindow.name方法获取到name数据。
``` javascript
  // 'http://localhost:3005/html/parent.html 
  var state = 0;
  var iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = 'http://localhost:3005/html/data.html';
  document.body.appendChild(iframe);
  if(iframe.attachEvent){
    iframe.attachEvent('onload',loadfn);
  }else{
    iframe.onload = loadfn;
  }
  function loadfn(){
    if(state == 0){
      state = 1;
      iframe.contentWindow.location = 'http://localhost:3004/html/proxy.html'
    }else if(state == 1){
      var data = iframe.contentWindow.name;
      alert(data);
    }
  }
  // 数据页面
  window.name = '我是数据源头';
  console.log('数据窗口name:'+ window.name);
```
4,postMessage
> 原理：HTML5新增的postMessage方法，通过postMessage来传递消息，对方可以通过message事件来监听消息。可跨主域名及双向跨域。  
疑惑：查看资料发现都是postMessage都是用在iframe场景当中，理应在任何页面。
实现： postMessage(data,origin), 两个参数， window.addEventListener('message',function(event){}, false) 三个参数。
```javascript
// 父页面
var btn = document.getElementById('btn');
btn.onclick = function(){
  var ifr = document.getElementById('ifr');
  var data = '我请求数据';
  ifr.contentWindow.postMessage(data, '*');
}
window.addEventListener('message',function(e){
  console.log(e.data);
})
// iframe页面
window.addEventListener('message',function(e){
  console.log(e.data);
  var data = '我是返回数据';
  window.parent.postMessage(data, '*');
}, false)
```
5，location.hash
> 原理：利用location.hash来进行传值
> 实现方式：hash-a.html中创建url为hash-b.html的iframe,参数放入url中，hash-b.html获得参数并处理，创建和hash-a同域的iframe：hash-c.html，并将数据放入hash中带入，在hash-c.html中拿到数据并修改hash-a.html的hash值。这点和window.name很相似，一个是放入window.name中 一个是放在hash中。  
hash-a.html
```html
<iframe id="ifr" src="http://localhost:3005/html/hash-b.html#data=hello" frameborder="0"></iframe>
```
hash-b.html
```javascript
  var hash  = location.hash.substring(1);
    console.log(hash);
    var newHash = hash + ' world';
    var iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:3004/html/hash-c.html#'+newHash;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
```
hash-c.html
```javascript
window.parent.parent.location.hash = self.location.hash.substring(1);
```
>总结：  
跨域方式有以上5种，常用的方式有cors、jsonp；  
比较相识的有window.name 和 location.hash 都是套一个代理iframe实现同域后，读取数据；
postMessage是H5新增特性。