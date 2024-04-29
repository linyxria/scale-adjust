# scale-adjust

可视化大屏 scale 适配方案

## 安装

```shell
pnpm add scale-adjust
```

## 使用

```html
<body>
  <div id="app">
    <div id="container"></div>
  </div>

  <script type="module">
    import { Scaler } from 'scale-adjust'

    const scaler = new Scaler({
      /**
       * @description 大屏挂载元素, 该元素的父元素应具有合适的高宽
       */
      el: '#container',
      /**
       * @description 大屏宽度
       */
      width: 1920,
      /**
       * @description 大屏高度
       */
      height: 1080,
    })
    /**
     * 监听大屏 scale 改变事件
     */
    scaler.onScale((scale) => {
      console.log('scale:', scale)
    })
  </script>
</body>
```
