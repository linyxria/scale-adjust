import './style.css'

import { Scaler } from '../lib/main'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div id="container">
  </div>
`

const container = document.querySelector<HTMLDivElement>('#container')!
container.style.backgroundColor = 'aquamarine'

/**
 * 参照 window
 */
// new Scaler(container, 1920, 1080)

/**
 * 参照某个元素
 */
app.style.width = '64vw'
app.style.height = '48vh'
app.style.backgroundColor = 'bisque'
// 参照父元素
// new Scaler('#container', 1920, 1080, { reference: true })
// 参照任意元素
const scaler = new Scaler('#container', 1920, 1080, { reference: '#app' })

// 监听 scale 变化
scaler.listen(({ scale }) => {
  console.log('scale:', scale)
})
