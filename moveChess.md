## react 版跳棋

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;最近在学校闲着也是闲着，打算复习一下react，想写点什么东西，最后决定写一个跳棋打发闲暇的时光。最后按照自己设想的写完了，由于是基于create-react-app的架子，不能放在codepen上有一点遗憾，不过本文最后给了线上地址和github地址，大家感兴趣可以看看，欢迎批评指正。

### 效果图
![chess](http://oymaq4uai.bkt.clouddn.com/reactChess.gif)


### 总体思路

我们把跳棋这个项目先拆分为以下步骤

1. 画出棋盘和棋子 (UI 层面)
2. 判断棋子的可跳路径 (逻辑层面)
3. 跳棋的动画(UI + 逻辑层面)

#### 关于画出棋盘(UI)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;我们仔细观察棋盘, 首先棋盘是由6个等边三角形(棋子)和中间一个正六边形(空闲的棋盘)组成。这里就教大家怎么画出这6个等边三角形吧, 先给个示意图吧。

![keyboard](http://oymaq4uai.bkt.clouddn.com/chess-keyboards.png)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在画这些棋子之前我们先做出如下思考，首先这6个三角形是对称的，即可以通过绕某一点旋转得到，其次任意两个棋子的距离是相同的。 

#### 第一步: 画出轮廓
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 即需要画出 AEI 和 CMG 这两个等边三角形。

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;这一步可以用border实现，这也是比较常规的方法，然后CMG就是AEI旋转180deg得到的图形。这里要注意一下，旋转的中心点是O点，大家要设置好transform-origin.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当然最最重要的一点，棋盘是要适配的，即它的宽度不能写死，我们把它写成一个变量最好了，为了大家看的清楚，我截取一段scss给大家看看。

	$width: 250px;
	$height: $width * sqrt(3);
	$rotateY: round(($width * 2 * 2 / 3 ) * sqrt(3) / 2);  
	$containerX: 2 * $width;
	$containerY: 2 * $rotateY;
	$radius: getGap($width, 0.4) / 2;     //0.4 是gap 和 直径的比
	$gap: 2 * 0.4 * $radius; 
	
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;这里width和rotateY分别指示意图中加粗黑框宽的1/2和，高的1/2。	黑框的宽高分别为上述的containerX，containerY。radius指小球的半径，gap指棋子之间的间距。这里所有的属性只依赖于变量width，方便棋盘的放大和缩小，我们可以写下如下式子。


#### 第二步: 画出棋子(干货来了)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;我们首先画出角BAN上的10个棋子，我们从上往下画，一共四层，每一层为当前层数个棋子。我们把AE上的棋子做为每一层的起始点。

	width 黑色容器的宽 也为三角形边长 = A E
	而三角形的每条边上平均放置了12个棋子，即棋子间距为 width / 12
	
	
	第一层 chess-0-0  起始点(width/2, 0)
	第二层 chess-0-0  起始点(width/2 - 棋子间距/2, 棋子间距 * Math.sqrt(3)/2)
	      chess-0-1  (chess-0-0.x + gap, chess-0-0.y)
	...
	
  	@for $i from 0 to 4{
     	@for $j from 0 to ($i+1){
			left: $width  -  $width * 2 / (4 * 3 * 2) * $i + $j * $width * 2 / (4 * 3);
			top: $i * $gap + 2 * $radius * $i) * sqrt(3) / 2     
     	}
    } 	
		
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;这时候棋子单边的棋子就出来了，可是我们需要6边的棋子呀，难道我们要一边一边画吗？ 答案肯定是No NO No啊!

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;好，我们现在按照我们之前的思路把角依次BAN旋转60deg。首先我们有几个注意点：

+ 我们在绘制棋子的时候left为棋子的左上角，这个左上角并不是棋盘的顶点，我们需要通过css(transform: translate(-50% -50%))将球的左上角的点移至棋盘上。

+ 我们棋子的父标签是那个黑色的container，而我们旋转的中心点是上图中的O点。

<img src="http://oymaq4uai.bkt.clouddn.com/rotate_fomula.png"
	  width=250px; height:250px;></img>
		
		我们来推导一些公式 (点的旋转公式）
		A 点坐标 (x1,y1) 与 x 轴夹角为 b
		B 点坐标 (x2, y2) 与 AO 夹角为 c
		这里换算成极坐标
		则 x1 ＝ rcosb      y1 = rsinb      
		   x2 = rcos(b+c) = rcosbcosc - rsinbsinc = x1cosc - y1sinc
		   y2 = rsin(b+c) = rsinbcosc + rcoscsinb = x1sinc + y1cosc
		   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;但是我们的中心点默认是容器的左上角，不是容器的中心点呀。容易，我们坐标平移一下就好了。

	x2 = (x - w)cosc - (y - h)sinc 
	y2 = (x - w)sinc	+ (y - h)cisc
	
	这时候的x2,y2 是相对于O中心点旋转后的坐标, 我们再返到之前的坐标系中。
	
	x2 = (x - w)cosc - (y - h)sinc ＋ w
	y2 = (x - w)sinc	+ (y - h)cisc + h
	
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;没错，就是这样，我们现在对BAN旋转吧，贴上scss的代码(话说三层循环真是有一点麻烦呢!)

	@for $k from 0 to 6{
  		@for $i from 0 to 4{
    		@for $j from 0 to ($i+1){
		      .chess-#{$k}-#{$i}-#{$j}{
			      left: cos(60deg * $k) * ($width  -  $width * 2 / (4 * 3 * 2) * $i + $j * $width * 2 / (4 * 3) - $width) - sin(60deg * $k) * (($i * $gap + 2 * $radius * $i) * sqrt(3) / 2 - $rotateY) + $width;
			      top: sin(60deg * $k) * ($width  -  $width * 2 / (4 * 3 * 2) * $i + $j * $width * 2 / (4 * 3) - $width) + cos(60deg * $k) * (($i * $gap + 2 * $radius * $i) * sqrt(3) / 2 - $rotateY) + $rotateY; 
		      }
   			 }
  		}
	}

最后棋盘就是下面这样了！！！ 是不是很有趣呢 :)
		
<iframe height='400' scrolling='no' title='chessBoard' src='https://codepen.io/shadowwalkerzero/embed/zRVZvx/?height=265&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='https://codepen.io/shadowwalkerzero/pen/zRVZvx/'>chessBoard</a> by shadowwalkerzero (<a href='https://codepen.io/shadowwalkerzero'>@shadowwalkerzero</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>


#### 第三步 画出棋盘
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;我们现在需要画出棋盘上的点，即棋子可以放的点。拆分一下棋盘，棋盘是由中心的正六边形和那6个角组成，正6边形按照我们之前的方法绘制是不是很简单呢？ 就是把三角形上的点绘出来，然后旋转6次就好了。这里就不赘述了。


#### 计算棋子可跳路径(逻辑)
因为棋子都是绝对定位的，我们要计算下一跳的点，必然要计算出它的精确坐标呀。可是我该怎么表示这些点呢？拿二维坐标吗？当然可以了，毕竟是2d，但是这样就太笨了，太笨了！

我们需要观察一下棋盘，其实棋子可以跳的点最终可以表现为6边形，画个示意图吧。


![img](http://oymaq4uai.bkt.clouddn.com/key-board-jump.png)

所以我们需要把跳棋上的点表示成3元组。例如正六边形斜上方的点就该表示成chess-1-2-2 单位是当前轴上两个点的距离。

这里干脆也把给棋子编号的方法也告诉大家吧。其实也很简单，就是利用点到直线间距离公式(
 d = Math.abs(AX + BY + C) / Math.sqrt(A^2+B^2); 
)

我们对一个点分别向3条轴计算三次距离，距离一样的就在一条线上。

看一下编号结束后的棋盘吧。

![img](http://oymaq4uai.bkt.clouddn.com/key-board-code.png)

#### 计算棋子的落点(广度优先)

这里我们需要明确一下跳棋的规则，跳棋是既可以向周围滚一步，也可以隔着棋子跳的。
为了标示棋盘该点已被占用，我们需要引入一个属性isOccupy来标示。这里给出棋盘上的点的数据结构。

	{
            key: `,
            isChess: ,
            locate: '',
            style: {
              background: ,
              left: ,
              top:,
              zIndex: 2，
              transform: 
    }
    
  这里解释一下各个属性 isChess 用来区分棋盘上的点和棋子，locate表示棋子或棋盘上的点的编号。style标示棋子或棋盘上的点坐标，还有一些辅助属性，比如当前要走的棋子会显得大一点。既然我们已经获取到了关于棋子和棋盘上的所有信息，下一步就是要让棋子跳起来了。

	我们再画一个简单的示意图
		
		 X 0 (0) X 0 
	我们以 0 表示棋子， X表示棋盘上的空点。(0) 表示正要跳的棋子。
	
	显然流程异常的简单：
	1. 从当前(0) 位置分别向左，右搜寻，直至找到左边和右边的距离最近0(注意我们是三条轴，分别向三条轴搜寻)。
	2. 以刚找到的点为基点，当正要跳的棋子和找到的点距离为长度，找出对称的点，即棋子的	落点。
	3. 将上一步的落点做为当前点。
	回到第一步
	
稍微分析一下 会发现是很简单的递归，发现从当前点向左右搜寻找点，真是和二叉树一模一样，问题就转变为二叉树的遍历上了。

当让遍历方法非常多，深度优先算法和广度优先算法都可以，但是作者这里推荐广度优先算法，因为广度优先算法调试更方便，层数浅，我也是基于广度优先算法实现的。

我们这里简单缕一下广度优先算法的思路，写一下伪码。
	
	思路是 一个队列 path: []
	压入左右搜寻的点 path.push[A.left, A.right]
	压出left  path: [A.right]
	压入A.left 左右搜寻的点 path: [A.right, A.left.left, A.left.right]
	
	
	//itemMove 指当前要跳的棋子
	//position 放置了棋盘上的点和棋子
	// 广度优先队列
	//passNode 收集棋子的落点

	calculatePath = (itemMove, position, allPath, passNode) => {
		let path = getValidPoint(itemMove) //获取三条轴上的落点
		allPath.push(...path);
		
		if(allPath.length > 1){
		   let  nextJump = allPath[0];
		   allPath.splice(0, 1);
		   passNode.push(nextJump);	//这就是下一跳了
		}
		 return nextJump ? calculatePath(nextJump, position, allPath, passNode) : passNode;
	}

当然这里有一个小问题，即成环的问题，你跳过去，下一跳又给你跳回来，就会死循环。这个问题解决的方法也很多，把走过的路径节点都标示一下，参照上面的伪码，所有的路径节点都在pressNode下，只要这个节点走过了，就不允许再走一遍。

#### 现在要让棋子真的跳起来(深度优先)

为了更好的交互，让跳棋跳起来是必须的！我们先捋捋我们现有的数据

+ 跳棋的起跳点和最终的落点，
+ 以及中间的过渡点(就是上一节中跳棋的所有落点)。

然后我们的问题: **就是当用户点击任意一个落点时，要让跳棋一级一级的跳过去**。

为了把路径确定出来，我们必须把这些过渡点连接起来，当用户点击任意一个落点时候，我们需要计算从起跳点和落点的距离。

**1.来把这些落点连接起来吧**

在确定跳棋的落点的时候，我们检索出了一个棋子的所有落点。为了不让这些数据丢失, 我们可以用记录一下。

  	nextJump.parent = startJump

nextJump 就是startJump 的所有落点，我们用parent来保存它们的联系。现在我们就要把它们串起来了，先从简单的例子出发吧。在设置为parent后，我们大概得到了一组类似这样的数据。

	let points = [{
	    name: 'A',
	    parents: ['C']
	},{
	    name: 'C',
	    parents: ['D']
	}, {
	    name: 'D',
	    parents: ['E']
	}, {
	    name: 'E',
	    parents: ['L', 'F']
	}, {
	    name: 'F',
	    parents: ['C']
	}, 
	{
	    name: 'L',
	    parents: []
	}]

上面的数据对应的示意图如下,大致为一个联通图。

![access](http://oymaq4uai.bkt.clouddn.com/key-board-acess.png)

假设我们从起点A出发要到终点L，求出A - L 的路径。常规方法就是深度优先了。我们简单描述一下流程(主要注意成环的问题)。
	
	1.路径队列 [L] 当前节点 L
	2.获得 L 的 parent [E]
	3.E进栈 [L,E]
	4.E. 做为下一个节点，要是 E 没有 parent 或者成环 E 出栈
	重复1 直至找到A
	
	附上代码
	let flag = false;
	function scanPath(start, end, path) {
  	 let nextLists = getParents(start);	//获取节点的parent
   	 let nextJump = false;

    for (let i = 0; i < nextLists.length; i++) {
        nextJump = nextLists[i];
        if (path.indexOf(nextJump) < 0) {
            !flag && path.push(nextJump);
            if (nextJump === end) {
                flag = true;
            }
            !flag && scanPath(nextJump, end, path);
        }
    }
    	!flag && path.pop();
    	return path;
	}

这里我们就把起始点和落点的路径找出来了，现在就要让棋子做动画了。

**2.棋子跳吧**(作者没有很好的解决)

我们描述一下我们上一步获得的路径，大致为  ['11-2-4', '6-8-13', '14-8-9', '9-3-8']。这里的元素对应上述我们对棋盘编号的三元组。
表示 棋子要从 11-2-4 -> 6-8-13 -> 14-8-9 -> 9-3-8 一路跳过去。

似乎实现也不难，在我们刚学前端的时候，不借助react也可以做到，对dom做tiansition动画，然后监听onTransitionEnd事件，在这里面继续做下一步动画，自己也试着用这种最土的方法做。只是在react中一切都是state了。

比如当前节点要跳 4跳，我们拿到路径数组 ['11-2-4', '6-8-13', '14-8-9', '9-3-8'] 起跳点 11-2-4 我们 找到11-2-4的棋子 把它的style 设置成 数组的[index] 就好了，我这里的解决方案是。

	  styles.map((item, index) => {
          setTimeout(() => {
            this.setState({
              nowStyle: styles[index]
            })
          }, 600 * (index + 1));
        });
styles 就是路径数组里路径节点的style，主要是left,top。nowStyle 就是起跳的棋子要不断应用的style。放一张自己的测试图，时间为600ms的原因是因为transition的时间是 500ms，总要先让动画做完把。

![img](http://oymaq4uai.bkt.clouddn.com/chessmove.gif)

但是这里我并不认为这个方案可行，react的diff render时间 还有不同浏览器性能的时间都不可控，settimeout真是下下策。


中间也求助过一些很优秀的react动画库，比如react-motion。发现它能做一组动画的只有StaggeredMotion，但是在文档中，作者写明了：

> (No onRest for StaggeredMotion because we haven't found a good semantics for it yet. Voice your support in the issues section.)

就是对组动画不提供回调，也就是说我们没法监听这组动画里的某一个动画，真是遗憾。

由于作者并不觉得这个解决方案很好，所以没有放在应用在项目的线上中，但是放在github目录下，感兴趣的同学可以提供自己的解决方案。

	
#### 一些零散的问题
1. **比如怎么判断输赢**

	这个问题我们可以在初始化棋盘就解决掉，比如假设现在执棋方是绿色，那么它的目的地是粉色，一开始的时候就把各个执棋方的目的地的位置计算好，每走一步，就check一下。

2. **比如怎么做到棋手轮流下**

	这个我们需要一个状态位控制，表示当前棋手，下完一步，加1对所有选手取余就好了。
		 
#### 关于react动画的一点思考
以下为本人个人观点，不保证正确。

1. react做这种需要一定计算的网页，最让我担心的是性能，每走一步就涉及到多个状态，比如isOccupy 占位，下一跳的坐标。要是setstate({}) 肯定不行，因为这是异步的，会批量处理。所以只能setstate((prevState, prevProps) => {})，这样大量的diff，对性能肯定是个挑战。这里作者是没有实时更新数据的，计算完一次更新，但是这样就不方便state 调试，而且redux写多了，数据一旦不更新，心里就很慌。

2. react 由于数据驱动，确实代码更加简洁，但是相比之前写的原生动画，状态太多，所有的状态都挤在state里，逻辑会很的很混乱(也有可能是自己水平有限)

3. 我觉得react并不适应动画场景，我们知道jquery 的animate本身也是基于setInterval实现的，而react 本身框架极其复杂，我们很难把控时间（也是自己水平有限）。


### 项目相关
  > [github地址](https://github.com/FounderIsShadowWalker/reactChess)
  
  > [线上地址](https://founderisshadowwalker.github.io/reactChess/)
  
