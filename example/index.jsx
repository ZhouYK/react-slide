import React from 'react';
import ReactDom from 'react-dom';
import Slide from '../src';
import './index.less';
const SlideItem = Slide.Item;

const Example = (props) => {
  const style = {
    width: 300,
    height: 300,
    marginLeft: 'auto',
    marginRight: 'auto'
  };
  return (
    <div className="demo-slide">
      <div className="code-source">
        <a href="https://github.com/ZhouYK/iron/blob/master/assets/js/components/Slide/index.js" target="blank">示例代码</a>
      </div>
      <div>
        <p>水平滚动 （无缓冲反馈）</p>
        <div style={style}>
          <Slide layout={'horizontal'} defaultActiveIndex={0} className={''} style={{}} slideFeedback={false} preSlide={function ( { activeIndex } ) {
            console.log('滑动开始:当前的slide序号', activeIndex)
          }} afterSlide={function ({ activeIndex } ) {
            console.log('滑动结束:当前的slide序号', activeIndex);
          }}>
            <SlideItem className={ 'slide-0' }>
              <div className="slide-0-content">测试文字内容</div>
            </SlideItem>
            <SlideItem className={ 'slide-1'}>
              <div className="slide-1-content" >测试文字内容</div>
            </SlideItem>
            <SlideItem style={{backgroundColor:'black'}} className={'slide-2'}>
              <div className="slide-2-content">测试文字内容</div>
            </SlideItem>
          </Slide>
        </div>
      </div>
      <div>
        <p>垂直滚动（有缓冲反馈）</p>
        <div style={style}>
          <Slide layout={'vertical'} defaultActiveIndex={1} className={''} style={{}} slideFeedback={true} preSlide={function ( { activeIndex } ) {
            console.log('滑动开始:当前的slide序号', activeIndex)
          }} afterSlide={function ({ activeIndex } ) {
            console.log('滑动结束:当前的slide序号', activeIndex);
          }}>
            <SlideItem className={ 'slide-0' }>
              <div className="slide-0-content">测试文字内容</div>
            </SlideItem>
            <SlideItem className={ 'slide-1'}>
              <div className="slide-1-content" >测试文字内容</div>
            </SlideItem>
            <SlideItem style={{backgroundColor:'black'}} className={'slide-2'}>
              <div className="slide-2-content">测试文字内容</div>
            </SlideItem>
          </Slide>
        </div>
      </div>
      <div>
        <p>无限滚动（垂直方向）</p>
        <div style={style}>
          <Slide infinite layout={'vertical'} defaultActiveIndex={0} className={''} style={{}} slideFeedback={true} preSlide={function ( { activeIndex } ) {
            console.log('滑动开始:当前的slide序号', activeIndex)
          }} afterSlide={function ({ activeIndex } ) {
            console.log('滑动结束:当前的slide序号', activeIndex);
          }}>
            <SlideItem className={ 'slide-0' }>
              <div className="slide-0-content">测试文字内容</div>
            </SlideItem>
            <SlideItem className={ 'slide-1'}>
              <div className="slide-1-content" >测试文字内容</div>
            </SlideItem>
            <SlideItem style={{backgroundColor:'black'}} className={'slide-2'}>
              <div className="slide-2-content">测试文字内容</div>
            </SlideItem>
          </Slide>
        </div>
      </div>
      <div>
        <p>自动轮播（水平方向）</p>
        <div style={style}>
          <Slide autoSlide layout={'horizontal'} defaultActiveIndex={0} className={''} style={{}} slideFeedback={false} preSlide={function ( { activeIndex } ) {
            console.log('滑动开始:当前的slide序号', activeIndex)
          }} afterSlide={function ({ activeIndex } ) {
            console.log('滑动结束:当前的slide序号', activeIndex);
          }}>
            <SlideItem className={ 'slide-0' }>
              <div className="slide-0-content">测试文字内容</div>
            </SlideItem>
            <SlideItem className={ 'slide-1'}>
              <div className="slide-1-content" >测试文字内容</div>
            </SlideItem>
            <SlideItem style={{backgroundColor:'black'}} className={'slide-2'}>
              <div className="slide-2-content">测试文字内容</div>
            </SlideItem>
          </Slide>
        </div>
      </div>
    </div>
  )
}

ReactDom.render(<Example />, document.getElementById('bd'));
