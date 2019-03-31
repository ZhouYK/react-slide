import React, { Component} from 'react';
import PropTypes from 'prop-types';
import './index.less';
import { preventDocMove, offPreventDefault, } from './common/preventDocMove';
const VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal';
const animation = 'cubic-bezier(0.645, 0.045, 0.355, 1)';

class Slide extends Component {
  static propTypes = {
    defaultActiveIndex: PropTypes.number, // 初始激活的slide
    className: PropTypes.string, // 类名
    style: PropTypes.object, // 样式
    preSlide: PropTypes.func, // 在划过该slide前会调用
    afterSlide: PropTypes.func, // 在划过该slide后会调用
    slideFeedback: PropTypes.bool, // 是否开启滑动反馈
    slideFeedbackTransformLimit: PropTypes.number, // 设置滑动反馈的上限值
    transformLimit: PropTypes.number, // 设置slide滑动的安全区域，一旦超过这个安全区域则会向前后者向后
    children: PropTypes.oneOfType( [
      PropTypes.arrayOf( PropTypes.node ),
      PropTypes.node
    ] ).isRequired,
    layout: PropTypes.oneOf([VERTICAL, HORIZONTAL]), // 布局方向
    infinite: PropTypes.bool, // 是否开启无限滚动
    autoSlide: PropTypes.bool, // 是否自动滚动，设置了自动滚动外部设置的infinite会失效，会强制无限滚动
    timeGap: PropTypes.number, // 滚动间隔 毫秒
    animation: PropTypes.string, // 贝塞尔曲线函数
  }
  static defaultProps = {
    defaultActiveIndex: 0,
    className: '',
    slideFeedback: true,
    transformLimit: 50,
    slideFeedbackTransformLimit: 80,
    layout: HORIZONTAL,
    infinite: false,
    autoSlide: false,
    timeGap: 1000,
    animation
  }
  constructor(options){
    super(options);
    const { defaultActiveIndex } = this.props;
    const count = this.calcChildCount();
    // 如果是自动slide或者infinite，那么在最开始的时候开发者设置的起始位置和代码中的位置会有偏移
    // 这个偏移是在getSlidePane里面造成的，体现在region中
    const defaultActiveIndexOffset = this.isInfiniteSlide() ? (defaultActiveIndex + 1) : defaultActiveIndex;
    this.state = {
      transform: - ( defaultActiveIndexOffset * 0 ),
      transition: '',
      region: this.progressRegion( { size: 0, count } ),
      activeIndex: defaultActiveIndexOffset,
      width: 0,
      height: 0,
    }
  }

  calcChildCount = () => {
    const { children } = this.props;
    const count = React.Children.count(children);
    if (!this.isInfiniteSlide()) return count;
    return count + 2;
  }

  calcOriginChildCount = () => {
    const { children } = this.props;
    return React.Children.count(children);
  }

  getSlidePane = () => {
    const { children } = this.props;
    const { width, height } = this.state;
    const childrenArr = React.Children.map( children , (child) => {
      if( !child ) return;
      const order = parseInt(child.props.order, 10);
      return React.cloneElement( child, {
        children: child.props.children,
        key: `slidepane-${order}`,
        width,
        height,
      })
    });
    // 如果设置了无限滚动，那么需要在头尾新增元素
    if (childrenArr && this.isInfiniteSlide()) {
      const { length } = childrenArr;
      const firstElement = React.cloneElement(childrenArr[0], {
        children: childrenArr[0].props.children,
        key: `slidepane-infinite-mini`,
        width,
        height
      });
      const lastElement = React.cloneElement(childrenArr[length - 1], {
        children: childrenArr[length - 1].props.children,
        key: `slidepane-infinite-max`,
        width,
        height
      });
      childrenArr.push(firstElement);
      childrenArr.unshift(lastElement);
    }
    return childrenArr;
  }
  /**
   * prevent sliding when current slide is the first or the last
   * @param direction
   * @returns {boolean}
   */
  slideFeedbackSwitch = ( direction ) => {
    const { slideFeedback, } = this.props;
    const { activeIndex } = this.state;
    const count = this.calcChildCount();
    if ( !slideFeedback ) {
      if ( direction === -1 ) {
        if ( activeIndex === count-1 ) {
          return false
        }
      } else if ( direction === 1 ) {
        if ( activeIndex === 0 ) {
          return false
        }
      } else if ( direction === 0 ) {
        return false
      }
    }
    return true;
  }
  whenSlideReachFeedbackTransformLimit = ( transformDistance ) => {
    const { region } = this.state;
    const { slideFeedbackTransformLimit, slideFeedback, } = this.props;
    const first = region[0];
    const last = region[region.length-1];
    const howFarFromBeginToCurrent = transformDistance - first,
      howFarFromEndToCurrent = last - transformDistance;
    let finalTransformDistance = transformDistance;
    // 实现回拉过边界后恢复原状的效果（类似微信）
    if( !slideFeedback ) {
      if( howFarFromBeginToCurrent >= 0 ) {
        finalTransformDistance = first;
      } else if ( howFarFromEndToCurrent >= 0 ) {
        finalTransformDistance = last;
      }
      return finalTransformDistance;
    }
    if ( howFarFromBeginToCurrent >= slideFeedbackTransformLimit ) {
      finalTransformDistance = slideFeedbackTransformLimit;
    } else if( howFarFromEndToCurrent >= slideFeedbackTransformLimit ) {
      finalTransformDistance = last - slideFeedbackTransformLimit;
    }
    return finalTransformDistance;
  }

  calcXY = ( event ) => {
    if (event.changedTouches) {
      return {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY
      }
    }
    return {
      x: event.clientX,
      y: event.clientY
    }
  }

  start = ( event ) => {
    const clientXY = this.calcXY(event);
    this.startX = clientXY.x;
    this.startY = clientXY.y;
    const { preSlide } = this.props;
    const { activeIndex } = this.state;
    preSlide ? preSlide( { activeIndex, } ) : '';
    this.switchRate = undefined;
    this.preventDocMove = false;
    this.isPressed = true;
    this.cacheTransform = this.state.transform;
  }
  move = ( event ) => {
    if (this.isPressed) {
      this.cancelAutoSlideSchedule();
      const clientXY = this.calcXY(event);
      this.moveX = clientXY.x;
      this.moveY = clientXY.y;
      const { layout } = this.props;
      let currentMove;
      if ( layout === VERTICAL ) {
        currentMove = this.moveY - this.startY;
      } else if ( layout === HORIZONTAL ) {
        currentMove = this.moveX - this.startX;
      }
      if ( currentMove !== 0 && this.switchRate === undefined ) {
        const direction = currentMove > 0 ? 1 : ( currentMove < 0 ? -1 : 0 );
        // 判断是否触边，是否进行slide反馈
        if ( !this.isInfiniteSlide() && !this.slideFeedbackSwitch( direction ) ) {
          return;
        }
        const otherAxis = layout === HORIZONTAL ? this.moveY - this.startY : ( this.moveX - this.startX );
        this.switchRate = Math.abs( otherAxis / currentMove );
      }
      if ( this.switchRate <= 0.7 ) {
        this.preventDocMove = true;
        let transformDistance = this.cacheTransform + currentMove;
        if (!this.isInfiniteSlide()) {
          transformDistance = this.whenSlideReachFeedbackTransformLimit( transformDistance )
        }
        this.setState({
          transform: transformDistance,
          transition: ''
        })
      }
    }
  }
  end = ( event ) => {
    const clientXY = this.calcXY(event);
    this.endX = clientXY.x;
    this.endY = clientXY.y;
    this.preventDocMove = false;
    this.isPressed = false;
    const { afterSlide, layout, } = this.props;
    let distance;
    if ( layout === HORIZONTAL ) {
      distance = this.endX - this.startX;
    } else {
      distance = this.endY - this.startY;
    }
    const direction = distance > 0 ? 1 : ( distance < 0 ? -1 : 0 );
    const { transform, index }= this.onlySlideInRegion( direction );
    this.autoSlideSchedule();
    this.setState( {
      transform,
      transition: 'transition',
      activeIndex: index
    },() => {
      afterSlide ? afterSlide( { activeIndex: index, } ) : '';
    })
  }

  // 根据提供的transform计算出对应的slide的下标，当然需要判断方向
  // eg: region = [0, -300, -600, -900]
  binaryChop = ( { region, target, direction } ) => {
    //此处region由大到小排列
    let left = 0,
      right = region.length - 1,
      mid = Math.floor( ( left + right ) / 2 );
    //递归的函数同步执行的，不能简单的return
    const iterator = ( mid ) => {
      if ( mid === left ) {
        if( region[mid] === target) {
          return [mid]
        }
        if( region[right] === target) {
          return [right];
        }
        return [left,right];
      } else {
        if ( region[mid] > target ) {
          left = mid;
        }else if ( region[mid] < target ) {
          right = mid ;
        }else {
          return [mid];
        }
        mid = Math.floor( ( left + right ) / 2 );
        //在调用出return
        return iterator( mid );
      }
    }
    const result = iterator( mid );
    if ( result.length === 1 ){
      return {
        transform: region[result[0]],
        index: result[0]
      }
    } else {
      if ( target > region[result[1]] && target < region[result[0]] ) {
        //与左边界超过20(可设置)以上则滑道右边界，否则恢复到左边界
        let distance ;
        if ( direction === -1 ){
          //手指向左滑动
          distance = region[result[0]] - target
        } else if ( direction === 1 ){
          //手指向右滑动
          distance = target - region[result[1]];
        }
        const { transformLimit } = this.props;
        if ( distance >= transformLimit ) {
          if ( direction === -1 ) {
            return {
              transform: region[result[1]],
              index: result[1],
            }
          }else {
            return {
              transform: region[result[0]],
              index: result[0],
            }
          }
        } else {
          if ( direction === -1 ) {
            return {
              transform: region[result[0]],
              index: result[0],
            }
          }else {
            return {
              transform: region[result[1]],
              index: result[1],
            }
          }
        }
      } else if ( target > region[result[0]] ) {
        //超出左边界
        return {
          transform: region[result[0]],
          index: result[0],
        }
      } else if( target < region[result[1]] ){
        //超出右边界
        return {
          transform: region[result[1]],
          index: result[1],
        }
      }
    }
  }
  // 只能在region范围内滚动
  onlySlideInRegion = ( direction ) => {
    const { region, transform: target } = this.state;
    return this.binaryChop( { region, target, direction } );
  }
  // 计算各slide的边界
  // eg: region = [0, -300, -600, -900]
  progressRegion = ({size, count}) => {
    const region = [];
    const iterator = (count) =>{
      if(count>0){
        region.push( -size * ( count - 1 ) )
        iterator( count-1 );
      } else {
        region.reverse();
      }
    }
    iterator(count);
    return region;
  }

  // 自动滚动定时器
  autoSlideSchedule = () => {
    const { autoSlide, timeGap } = this.props;
    const { region } = this.state;
    this.cancelAutoSlideSchedule();
    if (autoSlide) {
      this.timeout = setTimeout(() => {
        const { activeIndex } = this.state;
        const index = activeIndex + 1;
        this.setState({
          activeIndex: index,
          transform: region[index],
          transition: 'transition'
        });
      }, timeGap);
    }
  }

  // 自动滚动取消
  cancelAutoSlideSchedule = () => {
    const { autoSlide } = this.props;
    if (autoSlide) {
      clearTimeout(this.timeout);
    }
  }

  isInfiniteSlide = () => {
    const { autoSlide, infinite } = this.props;
    return autoSlide || infinite;
  }

  // 获取元素宽度和高度，因为css中对Slide中的包裹元素设置了width和height都是100%。经历两次render
  // 这里让slide适应外部包裹元素
  getLayout = ( instance ) => {
    if ( !instance ) return;
    const { layout } = this.props;
    const { activeIndex } = this.state;
    const count = this.calcChildCount();
    const width = instance.offsetWidth,
      height = instance.offsetHeight;
    const size = (layout === HORIZONTAL) ? width : height;
    const region = this.progressRegion( { size, count } );
    this.setState( {
      width,
      height,
      region,
      transform: region[activeIndex],
      transition: ''
    }, () => {
      this.autoSlideSchedule();
    });
  }

  // 处理无限滚动
  // 第一个或者最后一个滚动完后需要对当前视图transform进行设置
  // 视觉欺骗
  handleTransitionEnd = () => {
    if (this.isInfiniteSlide()) {
      const { activeIndex, region } = this.state;
      const originalCount = this.calcOriginChildCount();
      if (activeIndex === 0) {
        this.setState({
          transform: region[originalCount],
          transition: '',
          activeIndex: originalCount
        });
      } else if (activeIndex === originalCount + 1) {
        this.setState({
          transform: region[1],
          transition: '',
          activeIndex: 1
        }, () => {
          this.autoSlideSchedule();
        });
      } else {
        this.autoSlideSchedule();
      }
    }
  }

  componentDidMount() {
    preventDocMove.call( this );
  }
  componentWillUnmount() {
    offPreventDefault.call( this );
  }
  render() {
    const { style, className, layout, animation } = this.props;
    const { width, height, transition, transform, } = this.state;
    const count = this.calcChildCount();
    const styleOfSlideCollection = {
      width: `${ layout === HORIZONTAL ? width * count: width }px`,
      height: `${ layout === HORIZONTAL ? height : height * count }px`,
      transform: `translate${ layout === HORIZONTAL ? 'X' : 'Y' }(${ transform }px)`,
      WebkitTransform: `translate${ layout === HORIZONTAL ? 'X' :'Y' }(${ transform }px)`,
      transition: `${ transition ? `transform .6s ${animation}` : ''}`,
      WebkitTransition: `${ transition ? `-webkit-transform .6s ${animation}` : ''}`
    };
    const wrapClassName = `slide-wrap ${className}`;
    return <div ref={ this.getLayout } className={ wrapClassName } style={ style }>
      <div
        className={`slide-collection`}
        style={styleOfSlideCollection}
        onTouchStart={this.start}
        onTouchMove={this.move}
        onTouchEnd={this.end}
        onTouchCancel={this.end}
        onMouseDown={this.start}
        onMouseMove={this.move}
        onMouseUp={this.end}
        onMouseLeave={this.end}
        onTransitionEnd={this.handleTransitionEnd}
      >
        {this.getSlidePane()}
      </div>
    </div>
  }
}

class SlideItem extends Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf( PropTypes.node ),
      PropTypes.node
    ])
  }
  static defaultProps = {
    style: {},
    className: ''
  }
  render(){
    const { width, height, style, className, children, } = this.props;
    const styleOfSlidePane = Object.assign( {}, style, {
      width: `${width}px`,
      height: `${height}px`,
    })
    const sectionClassName = `slide-item ${className}`;
    return <section className={sectionClassName} style={styleOfSlidePane}>
      { children }
    </section>
  }
}

Slide.Item = SlideItem;

export default Slide;

