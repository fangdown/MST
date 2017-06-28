## flex布局
flex是一个容器，容器有6大属性 
容器里有项目，项目有6个属性 

> 设置flex:display:flex; // box-flex,-webkit-flex

# 容器六大属性
 >1, flex-direction --方向
      row | row-reverse | column | colmn-reverse
  2, flex-wrap -- 换行
      nowrap | wrap | wrap-reverse
  3, flex-flow -- 方向 换行组合
      flex-direction || flex-wrap
  4, junstify-content --水平方向
      flex-start | flex-end | center | space-between | space-around
  5, align-items --垂直方向
      flex-start | flex-end | center | baseline | stretch
  6, align-content --多轴垂直方向
      flex-start | flex-end | center | baseline | stretch


# 项目六大属性
>1, order
    integer --值越小越靠前
 2, flex-grow
    number --放大比例，默认为0
 3, flex-shrink
    number --缩小比例，默认为1
 4, flex-basis
    lenght | auto
 5, flex
    flex-grow || flex-shrink || flex-basis --3者合写
    有两个快捷值 auto ( 1 1 auto) 、 none (0 0 auto)
    优先写这个属性
 6, align-self
    auto | flex-start | flex-end | center | baseline |stretch

