import './style.css'
import '../lib/scaler.css'

import { Scaler } from '../lib/main'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div id="container">
  </div>
`

/**
 * 参照 window
 */
// new Scaler({
//   el: container,
//   width: 1920,
//   height: 1080,
// })

/**
 * 参照父元素
 */
// new Scaler({
//   el: '#container',
//   width: 1920,
//   height: 1080,
//   reference: true,
// })

/**
 * 参照任意元素
 */
const scaler = new Scaler({
  el: '#container',
  width: 750,
  height: 1240,
  reference: app,
  transition: 'transform .3s ease-in-out',
})

/**
 * 监听 scale 变化
 */
scaler.listen(({ scale }) => {
  console.log('scale:', scale)
})
