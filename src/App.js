import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import cloneDeep from 'clone-deep';
import { uniq } from 'lodash';
import './App.scss';

const width = 300;
const height = width * Math.sqrt(3);
const rotateY = Math.round((width * 2 * 2 / 3) * Math.sqrt(3) / 2);
const radius = width * 2 / (12 + 12 * 0.4) / 2;
const gap = 2 * 0.4 * radius;

let isChessPathFind = false;

class App extends Component {

  state = {
    // chesses: [],
    position: [],
    lastPress: false,
    nextPress: false,
    selected: {
      key: '',
      style: {
        transform: `scale(1.1) translate(-50%, -50%)`,
        boxShadow: `0px 0px 5px 1px gray`,
        marginTop: `-1px`
      }
    },
    destination: [],
    turn: 0,
    press: false,
    colors: ['pink', 'orange', 'brown', 'green', 'purple', 'blue'],
    setTargets: {
      pink: {
        targetColor: 'green',
        targetArray: []
      },
      orange: {
        targetColor: 'purple',
        targetArray: []
      },
      brown: {
        targetColor: 'blue',
        targetArray: []
      },
      green: {
        targetColor: 'pink',
        targetArray: []
      },
      purple: {
        targetColor: 'orange',
        targetArray: []
      },
      blue: {
        targetColor: 'brown',
        targetArray: []
      }
    },
    AnimatePathStyle: [],
    nowStyle: {},
    nowStyleIndex: 0,
  }

  getChess = () => {
    //获取 6个角
    let { setTargets } = this.state;
    let { colors } = this.state;
    let position = [];
    let chesses = [];
    for (var k = 0; k < 6; k++) {
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < i + 1; j++) {
          position.push({
            key: `tri-${k}-${i}-${j}`,
            isChess: true,
            locate: '',
            style: {
              background: colors[k],
              left: Math.round(Math.cos(k * 60 * 2 * Math.PI / 360) * (width - width * 2 / (4 * 3 * 2) * i + j * width * 2 / (4 * 3) - width) - Math.sin(k * 60 * 2 * Math.PI / 360) * ((i * gap + 2 * radius * i) * Math.sqrt(3) / 2 - rotateY) + width),
              top: Math.round(Math.sin(k * 60 * 2 * Math.PI / 360) * (width - width * 2 / (4 * 3 * 2) * i + j * width * 2 / (4 * 3) - width) + Math.cos(k * 60 * 2 * Math.PI / 360) * ((i * gap + 2 * radius * i) * Math.sqrt(3) / 2 - rotateY) + rotateY),
              zIndex: 2
            }
          })

          position.push({
            key: `board-tri-${k}-${i}-${j}`,
            isChess: false,
            style: {
              left: Math.round(Math.cos(k * 60 * 2 * Math.PI / 360) * (width - width * 2 / (4 * 3 * 2) * i + j * width * 2 / (4 * 3) - width) - Math.sin(k * 60 * 2 * Math.PI / 360) * ((i * gap + 2 * radius * i) * Math.sqrt(3) / 2 - rotateY) + width),
              top: Math.round(Math.sin(k * 60 * 2 * Math.PI / 360) * (width - width * 2 / (4 * 3 * 2) * i + j * width * 2 / (4 * 3) - width) + Math.cos(k * 60 * 2 * Math.PI / 360) * ((i * gap + 2 * radius * i) * Math.sqrt(3) / 2 - rotateY) + rotateY),
              zIndex: 1
            }
          }
          )
        }
      }
    }


    //获取6边形上半边
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < i + 5; j++) {
        position.push({
          key: `hex-up-${i}-${j}`,
          isChess: false,
          style: {
            left: Math.round(2 * width / 3 - width * 2 / (4 * 3 * 2) * i + (gap + 2 * radius) * j),
            top: Math.round(rotateY / 2 + width * 2 / (4 * 3) * Math.sqrt(3) / 2 * i),
            zIndex: 1
          }
        }
        )
      }
    }

    //获取6边形下半边
    for (var i = 5; i < 9; i++) {
      for (var j = 0; j < 13 - i; j++) {
        position.push({
          key: `hex-down-${i}-${j}`,
          isChess: false,
          style: {
            left: Math.round(2 * width / 3 - width * 2 / (4 * 3 * 2) * 3 + width * 2 / (4 * 3 * 2) * (i - 5) + (gap + 2 * radius) * j),
            top: Math.round(rotateY * 3 / 2 - width * 2 / (4 * 3) * Math.sqrt(3) / 2 * 3 + width * 2 / (4 * 3) * Math.sqrt(3) / 2 * (i - 5)),
            zIndex: 1
          }
        })
      }
    }

    position = this.sort(position);

    console.log(position);

    this.setTarget(position);

    position = this.isOccupy(position);

    return { position };
  }

  setTarget = (position) => {
    let { setTargets } = this.state;

    position.map((item, index) => {
      if (item.isChess) {
        let color = item.style.background;
        let targetColor = setTargets[color]['targetColor'];
        setTargets[targetColor].targetArray.push(cloneDeep(item));
      }
    })

    this.setState({
      setTargets
    })
  }


  isOccupy = (position) => {

    let boards = position.filter((item) => {
      return !item.isChess;
    });

    let chesses = position.filter((item) => {
      return item.isChess;
    });

    boards = boards.map(item => {
      let isOccupy = chesses.filter((chess) => {
        return chess.locate === item.locate
      })

      isOccupy.length > 0 ? item.isOccupy = true : item.isOccupy = false;

      return item;
    });

    return boards.concat(chesses);
  }


  setMark = (prop, arr) => {
    let lastTop = arr[0].style[prop], y = 0;

    let sortArr = arr.map((item, index) => {
      let { top } = item.style;
      item.locate = item.locate || '';
      if (top != lastTop) {
        y++;
        item.locate += `${y}-`
      } else {
        item.locate += `${y}-`;
      }
      lastTop = top;
      return item;
    });

    return sortArr;
  }

  sort = (position) => {
    position = position.sort((arg1, arg2) => {
      return arg1.style.top > arg2.style.top ? 1 : -1
    });

    position = this.setMark('left', position);


    position = position.map((item, index) => {
      let { left, top } = item.style;
      let length = (Math.sqrt(3) * left + top - rotateY / 2) / 2
      let unit = 2 * width / 12 * Math.sqrt(3) / 2;
      let num = Math.round((length / unit).toFixed(2)) + 1;
      item.locate += `${num}-`;

      length = (Math.sqrt(3) * left - top + 2 * rotateY * 3 / 4) / 2;
      num = Math.round((length / unit).toFixed(2)) + 1;
      item.locate += `${num}`;
      return item;
    })

    return position;
  }


  componentDidMount() {
    this.setState({
      ...this.getChess()
    });
  }

  noop = () => { };

  isWin = (color, position) => {
    let { setTargets } = this.state;
    let target = setTargets[color];
    let colorChess = position.filter((item) => {
      return item.style.background === color;
    })
    let targetArray = target['targetArray'];
    let count = 0;

    targetArray.map((item, index) => {
      let { locate } = item;
      colorChess.map((chess, index) => {
        if (locate === chess.locate) {
          count++;
        }
      })
    });

    return count === targetArray.length ? true : false
  }

  getAnimatePathStyle = (pathLocate, destination) => {
    console.log('计算style');
    console.log(pathLocate, destination);

    //去掉 起点
    pathLocate.splice(0, 1);

    return pathLocate.map((locate) => {

      let exist = destination.filter(des => {
        return des.locate == locate;
      })

      if (exist.length > 0) {
        return exist[0].style;
      }
    })
  }

  chessMove = (key) => (e) => {
    let { press, selected, position, destination, turn, colors } = this.state;
    let start = 0, end = 0, startIndex = 0, endIndex;


    let permission = destination.filter((item, index) => {
      return item.key === key;
    })

    if (press && permission.length > 0) {
      position.map((item, index) => {
        if (item.key === selected.key) {
          start = item;
          startIndex = index;
        }
        else if (item.key === key) {
          endIndex = index;
          end = item;
        }
        return item;
      })


      let movedChess = {
        key: start.key,
        isChess: true,
        locate: end.locate,
        style: {
          ...end.style,
          background: start.style.background,
          zIndex: 2
        }
      }

      let styles = this.getAnimatePathStyle(this.defineAnimatePath(destination, start, end).reverse(), destination);



      this.setState({
        press: false,
        nextPress: movedChess,
        destination: [],
        nowStyle: styles[this.state.nowStyleIndex],
        turn: (turn + 1) % colors.length,
        AnimatePathStyle: styles,
        position: this.isOccupy([
          ...position.slice(0, startIndex),
          movedChess,
          ...position.slice(startIndex + 1)
        ])
      }, () => {
        let result = this.isWin(movedChess.style.background, this.state.position);
        result && alert(`${movedChess.style.background} win`);
        let AnimatePathStyle = this.state.AnimatePathStyle;
        // console.log('新鲜的', AnimatePathStyle);

        styles.map((item, index) => {
          console.log('你要跳几段', index)
          setTimeout(() => {
            console.log('我跳了几段', index, )
            // this.setState((prevState) => {
            //   prevState['nowStyle'] = styles[index]
            // })

            this.setState({
              nowStyle: styles[index]
            })
          }, 600 * (index + 1));
        });
      });
    }
  }

  getParents = (locate, path) => {
    let parents = path.filter((chess) => {
      return locate === chess.locate
    })

    if (parents.length < 1) {
      console.log(`你这个点${locate}没有parent`, parents, );
    }
    return parents[0]['parent'];
  }

  scanPath = (start, end, chesses, path) => {
    //debugger;
    let nextLists = this.getParents(start, chesses);
    let nextJump = false;

    for (let i = 0; i < nextLists.length; i++) {
      nextJump = nextLists[i];
      if (path.indexOf(nextJump) < 0) {
        !isChessPathFind && path.push(nextJump);

        if (nextJump === end) {
          isChessPathFind = true;
          return path;
        }

        !isChessPathFind && this.scanPath(nextJump, end, chesses, path);
      }

    }
    !isChessPathFind && path.pop();
    return path;
  }

  defineAnimatePath = (path, start, end) => {
    console.log('不要算跳棋动画的啊');
    console.log('path:', path, '起点:', start, '终点:', end);        //start 是跳棋起跳点    //end 是跳棋落点
    //console.log(this.getParents(end.locate, path))

    return this.scanPath(end.locate, start.locate, path, [end.locate]);
  }

  resetChessColor = () => {
    let { position, lastPress } = this.state;
    let index = -1;

    let moveChess = position.filter((item, i) => {
      return item.key === lastPress.key && (index = i);
    })

    const style = Object.assign({}, lastPress.style, {          //lastPress 无 trasnform
      left: position[index].style.left,
      top: position[index].style.top
    });

    return [
      ...position.slice(0, index),
      Object.assign({}, lastPress, { style }, { locate: position[index].locate }),
      ...position.slice(index + 1)]

  }

  exist = (itemMove, passNode) => {
    return passNode.filter((node) => {
      return node.key === itemMove.key
    })
  }

  getValidPoint = (itemMove, position, allPath, passNode) => {
    console.log('清算点了 ============================================', '现在的点是', itemMove);
    let path = [];
    let { locate } = itemMove;
    let axises = locate.split('-');
    let nextJump = null;
    //从左往右分别是 x-y-z   左上45deg 右下45deg  收集三条线上的点
    let arrs = [[], [], []];

    // console.log(itemMove, passNode, '0000000000');
    if (this.exist(itemMove, passNode).length <= 1) {

      position.map((item) => {
        if (!item.isChess && item.locate != itemMove.locate) {
          let { locate } = item;
          let itemAxises = locate.split('-');
          if (itemAxises[0] == axises[0]) {
            arrs[0].push(item);
          } else if (itemAxises[1] == axises[1]) {
            arrs[1].push(item);
          } else if (itemAxises[2] == axises[2]) {
            arrs[2].push(item);
          }
        }
      });

      //对三条线上的点排序
      arrs = arrs.map((arr) => {
        arr.push(itemMove);
        arr = arr.sort((arg1, arg2) => {
          return arg1.locate.split('-').slice(0, 2).join('') * 1 > arg2.locate.split('-').slice(0, 2).join('') * 1 ? 1 : -1;
        });
        return arr;
      })

      //获取3条线上6个点
      arrs.map((arr, index) => {
        let pos = -1;
        arr.filter((item, i) => {
          return item.locate == itemMove.locate && (pos = i);
        })

        let left = pos - 1, right = pos + 1;
        for (; left >= 0;) {
          if (arr[left].isOccupy) {
            console.log('发现了基点', arr[left], '起始点', itemMove);
            let flag = false;
            let end = left * 2 - pos;
            if (end < 0 || end >= arr.length) { console.log('对称点超出棋盘', '对称点是:', arr[left], '*****'); break; }
            for (let start = left + (end - left) / Math.abs(end - left);
              start >= Math.min(left, end) && start <= Math.max(left, end);
              start = start + (end - left) / Math.abs(end - left)) {
              if (arr[start].isOccupy) {
                flag = true;
                console.log('出现了干扰点', arr[start], '*****');
                break;
              }
            }
            if (!flag) {
              path.push(arr[end]);
            }
            flag = false;
            break;
          }
          else {
            left--;
          }
        }

        for (; right < arr.length;) {
          if (arr[right].isOccupy) {
            console.log('发现了基点', arr[right], '起始点', itemMove);
            let flag = false;
            let end = right * 2 - pos;
            if (end < 0 || end >= arr.length) { console.log('对称点超出棋盘', '对称点是:', arr[right], '*****'); break; }
            for (let start = right + (end - right) / Math.abs(end - right);
              start >= Math.min(right, end) && start <= Math.max(right, end);
              start = start + (end - right) / Math.abs(end - right)) {
              if (arr[start].isOccupy) {
                flag = true;
                console.log('出现了干扰点', arr[start], '*****');
                break;
              }
            }
            if (!flag) {
              path.push(arr[end]);
            }
            flag = false;
            break;
          }
          else {
            right++;
          }
        }

      })

      console.log('当前点下获取到总路径', path);

      //给所有的path下的节点 加上parent
      path = path.map((node) => {
        if (!node['parent']) {
          node['parent'] = [];
        }
        node['parent'].push(itemMove.locate);

        return node;
      })

      allPath.push(...path);

    }

    if (allPath.length >= 1) {
      nextJump = allPath[0];

      passNode.push(nextJump);

      allPath.splice(0, 1);
    }

    return nextJump ? this.getValidPoint(nextJump, position, allPath, passNode) : passNode;
  }

  cacalutePath = (itemMove, position) => {
    let path = this.getValidPoint(itemMove, position, [], []);
    //最后加上距离为1的点
    let { locate } = itemMove;
    let axies = locate.split('-');
    let aroundPathLocate = [
      `${axies[0] * 1}-${axies[1] * 1 - 1}-${axies[2] * 1 - 1}`,
      `${axies[0] * 1}-${axies[1] * 1 + 1}-${axies[2] * 1 + 1}`,
      `${axies[0] * 1 - 1}-${axies[1] * 1}-${axies[2] * 1 + 1}`,
      `${axies[0] * 1 + 1}-${axies[1] * 1}-${axies[2] * 1 - 1}`,
      `${axies[0] * 1 - 1}-${axies[1] * 1 - 1}-${axies[2] * 1}`,
      `${axies[0] * 1 + 1}-${axies[1] * 1 + 1}-${axies[2] * 1}`,
    ]

    position.map((item, index) => {
      if (!item.isChess && !item.isOccupy) {
        if (aroundPathLocate.indexOf(item.locate) > -1) {
          //console.log(item, '我错了', itemMove.locate);
          item['parent'] = [itemMove.locate];
          path.push(item);
        }
      }
    });

    //这里对path去重

    path = this.uniqPath(path);

    this.setState({
      destination: path
    })
    console.log('有效点:', path);
  }

  uniqPath = (path) => {
    let newPath = [];

    path.length > 0 && path.map((pathNode) => {
      let index;
      let tempoPath = newPath.filter((keyPathNode, i) => {
        if (pathNode.key === keyPathNode.key) {
          index = i;
          return true;
        } else {
          return false;
        }
      })

      if (tempoPath.length === 0) {
        if (!pathNode['parent']) pathNode['parent'] = [];
        newPath.push(pathNode);

      } else {
        let firstPathNode = cloneDeep(newPath[index]);
        for (let i = 0; i < tempoPath.length; i++) {
          firstPathNode['parent'] = firstPathNode['parent'].concat(tempoPath[i]['parent']);
        }

        firstPathNode['parent'] = uniq(firstPathNode['parent']);
        newPath[index] = firstPathNode;
      }
    })

    return newPath;
  }

  chessClick = (key) => (e) => {
    let { position, lastPress, selected, turn, colors } = this.state;
    let index = -1;

    isChessPathFind = false;
    position = this.isOccupy(position);


    position = position.map((item) => {
      item['parent'] = [];
      return item;
    });

    if (lastPress) {
      position = this.resetChessColor();
    }

    let moveChess = position.filter((item, i) => {
      return item.key === key && (index = i);
    })

    let tempo = position[index];

    // if (tempo.style.background === colors[turn]) {

    const style = Object.assign({}, tempo.style, selected.style);


    //计算路径
    this.cacalutePath(position[index], position);

    this.setState({
      lastPress: cloneDeep(tempo),
      press: true,
      nextPress: false,
      nowStyleIndex: 0,
      nowStyle: { left: tempo.style.left, top: tempo.style.top },
      AnimatePathStyle: [],
      position: [
        ...position.slice(0, index),
        Object.assign({}, tempo, { style }),
        ...position.slice(index + 1)
      ],
      selected: Object.assign({}, selected, { key })
    })
    // } else {
    //   alert(`请${colors[turn]}走!`)
    // }
  }

  render() {
    window.state = this.state;

    let { position, destination, lastPress, press, nextPress, AnimatePathStyle, nowStyle } = this.state;

    let postionChess = position.map((item, index) => {
      let { key, style, isChess, locate } = item;
      let reactDom = null;

      if (!isChess) {
        let pathExist = destination.filter((item, index) => {
          return item.locate == locate;
        })
        pathExist.length > 0 && (style = Object.assign({}, style, {
          border: `3px dashed #000`,
          padding: `5px`,
          backgroundClip: `content-box`
        }))
      }


      if (isChess && lastPress.key === key && nextPress) {
        reactDom = <div
          key={key}
          className="chess"
          onClick={isChess ? this.chessClick(key) : this.chessMove(key)}
          style={{
            left: nowStyle.left,
            top: nowStyle.top,
            background: lastPress.style.background,
            zIndex: lastPress.style.zIndex
          }}
        >
          {/* {locate} */}
        </div >
      }
      else {
        reactDom = <div
          key={key}
          className="chess"
          onClick={isChess ? this.chessClick(key) : this.chessMove(key)}
          style={{ ...style }}
        >
          {/* {locate} */}
        </div >
      }
      return reactDom
    });


    return (
      <div className="App" style={{
        width: 2 * width,
        height: 2 * rotateY
      }}>
        <div className="triangle triangle-0" style={{
          borderWidth: `0px ${width}px ${height}px ${width}px`,
          marginLeft: `-${width}px`
        }}>
        </div>
        <div className="triangle triangle-1" style={{
          borderWidth: `0px ${width}px ${height}px ${width}px`,
          marginLeft: `-${width}px`,
          transformOrigin: `${width}px ${rotateY}px`
        }}>
        </div>
        {
          postionChess
        }
      </div>
    );
  }
}

export default App;
