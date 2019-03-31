# rt-slide

## Slide

属性列表

| 属性名 | 类型 | 默认值 | 作用说明
| :----- | :----- | :----- | :----- |
| defaultActiveIndex | number | 0 | 默认显示的slide的序号，从0开始
| className | string | 无 | 自定义类名
| style | object | 无 | 自定义行内样式
| preSlide | function ({ activeIndex }){} | 无 | 在滑动最开始时调用
| afterSlide | function ({ activeIndex }){} | 无 | 在滚动完成后调用(具体时机在于transitionEnd触发)
| slideFeedback | bool | true | 是否开启滑动反馈，这个需要配合slideFeedbackTransformLimit
| slideFeedbackTransformLimit | number | 80，单位为px | 触发滑动反馈的上限值
| transformLimit | number | 50，单位为px | 滑动的安全区域值，一旦滑动超过这个值则会滑到下一个或者上一个slide
| children | SlideItem类型 | 必需，无默认值 | 单个slide item元素
| layout | 'horizontal'或者'vertical' | 'horizontal' | slide的滚动方向
| infinite | bool | false | 是否开启无限滚动
| autoSlide | bool | false | 是否开启自动轮播；开启了该设置会强制无限滚动
| timeGap | number | 1000，单位ms | 自动轮播间隔时间
| animation | string | 'cubic-bezier(0.645, 0.045, 0.355, 1)' | 贝塞尔曲线函数字符串

## 使用
```jsx harmony
        <div style={{
          width: 300,
          height: 300,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
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
```
<strong> Slide的宽度和高度由包裹它的元素决定，所以请对其包裹元素设置适当的宽高</strong>

## Slide.Item

| 属性名 | 类型 | 默认值 | 作用说明
| :---- | :---- | :---- | :---- |
| classNames | string | 无 | 自定义类名
| style | object | 无 | 自定义行内样式
| width | number | 继承Slide的宽度，单位px | 设置Slide.Item的宽度
| height | number | 继承Slide的高度，单位px | 设置Slide.Item的高度
| children | any或React.node | 无 | 渲染的内容
