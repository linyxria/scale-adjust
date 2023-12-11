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

    // 参照 window
    const scaler = new Scaler({
      el: '#container',
      width: 1920,
      height: 1080,
    })

    // 参照父元素
    const scaler = new Scaler({
      el: '#container',
      width: 1920,
      height: 1080,
      reference: true,
    })

    // 参照任意元素
    const app = document.getElementById('app')
    const container = document.getElementById('container')
    // 只是举例说明，可以直接使用 #container 和 #app
    const scaler = new Scaler({
      el: container,
      width: 1920,
      height: 1080,
      reference: app,
    })

    // 监听 scale 变化
    scaler.listen(({ scale }) => {
      console.log('scale:', scale)
    })
  </script>
</body>
```
