import './style.css'

import { Scaler } from '../lib/scaler'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div id="container">
  </div>
`

const scaler = new Scaler({
  el: '#container',
  width: 1920,
  height: 1080,
})
scaler.onScale((scale) => {
  console.log('scale:', scale)
})
console.log('scaler:', scaler)
