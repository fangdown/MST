#web安全-xss的原理及防御
##理解XSS的攻击原理和手段

> 反射型：发出请求时，XSS代码出现在URL中，作为输入提交到服务器端，服务器端解析后响应，XSS代码随响应内容一起传回给浏览器，最后浏览器解析并执行XSS代码，这个过程像一次反射，故叫反射型XSS。

```html
    // 如：index.html?xss=<img src ="null" onerror="alert(1)">
```

>存储型： 存储型和反射型XSS的差别在于提交的代码会存储在服务器端（数据库、内存、文件系统等），下次请求目标页面时不用再提交XSS代码。
## 掌握XSS攻击的防范措施
##1，编码
```
    // 如 xss =?xss=<img src ="null" onerror="alert(1)"<button onclick="alert('点我')">点我</button>
    function html_encode( str ){
    	var s = '';
    	if(str && str.length == 0) return '';
    	s = str.replace(/&/g, '&');
    	s = s.replace(/</g, '<');
    	s = s.replace(/>/g, '>');
    	s = s.replace(/\s/g, ' ');
    	s = s.replace(/\'/g, ''');
    	s = s.replace(/\"/g, '"');
    	s = s.replace(/\n/g, '<br>');
    	return s;
    }
    //后台存入的数据为
    "<img src="null" onerror="alert(1)"> <button onclick="alert('点我')">点我</button>"

    将以上特殊字符进行转义存入，读取时则按存入的文本进行展现，脚本不运行。
    转码方式和下面（过滤+校正）组合方式 选一种即可
```
##2，过滤
##3，校正
```javascript
    // 将字符串进行过滤和校正
// https://github.com/blowsie/Pure-JavaScript-HTML5-Parser/blob/master/htmlparser.js
// https://github.com/mathiasbynens/he.js
    var parse = function( str ){
			var results = '';
			try{
				HTMLParser(he.unescape(str,{strict: true}),{
					start: function(tag, attrs, unary){ // unary 是否单标签
						if(tag == 'script' || tag == 'style' || tag == 'link' || tag == 'iframe' || tag == 'frame'){
							return;
						}
						results += '<' + tag;
						// 循环属性，这里可以过滤onclick mouseover onerror等事件属性
						for(var i = 0, len = attrs.length; i < len; i++){
							if(attrs[i].name == 'onclick' || attrs[i].name == 'onerror'){
								break;
							}
							results += ' '+attrs[i].name + ' = ' + attrs[i].escaped;
						}
						results += (unary?' /':'') + '>'
					},
					end: function(tag){
						results += '</'+tag+'>';
					},
					chars: function(text){ // dom内容
						results +=text;
					},
					comment: function(text){ // 注释
						results +='<!--' +text+'--->';
					}
				});
				return results;
			}catch(e){
				console.log(e);
			}finally{
				
			}
		}
		getBtn.addEventListener('click',function(){
			var xhr = new XMLHttpRequest();
			var url = 'users/getComment';
			xhr.open('get',url,true);
			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4){
					if(xhr.status == 200){
					    // 过滤+校正
						var com = parse(JSON.parse(xhr.response).comment);
						var txt = document.createElement('span');
						txt.innerHTML = com;
						document.body.appendChild(txt);
					}
				}
			}
			xhr.send();
		})
		简要说明：当用户存入![](null) <button onclick="alert('点我')">点我</button>时，数据库保存的是该字符串，当读取该字段后，在ajax中进行了parse方法的过滤，校正工作，parse方法主要是解析当前字符串，对tag标签进行过滤组装，形成一个按需求的字符串，最后将该字符串插入到DOM中节点中。
```
> 比较：编码方式：对输入的内容进行转义，不做其他处理；可以阻止XSS攻击，有时候想要表达的代码也无法表达，灵活性较差；
过滤+校正方式：对输入的内容不做处理（可做编码处理），在输出的时候，对字符串进行标签过滤操作，过滤危险标签，如script style link (改变页面样式，如display等) iframe frame onerror等,最后闭合标签，保留需要的字符串，这种方式可以阻止XSS攻击,按需配置，灵活性较好。

>总结： 理解了XSS攻击的原理，手段，最最重要的是理解了如何去防御XSS攻击