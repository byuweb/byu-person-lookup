import {LitElement, html} from '@polymer/lit-element'
import {svg} from 'lit-html/lib/lit-extended'
class TestSvg extends LitElement {
  static get properties () {
    return {
      h: Number,
      w: Number
    }
  }

  _render ({h, w}) {
    const rect = svg`<rect x="0" y="0" width$="${w}" height$="${h}" />`
    return html`
      <h4>This is a test of svg in LitElement</h4>
      <style>
        svg {
          width: 500px;
        }
        rect {
          stroke: black;
          fill: #999;
        }
      </style>
      <svg viewbox$="0 0 ${w} ${h}" preserveAspectRatio="xMaxYMin meet">
        ${rect}
      </svg>
    `
  }
}

console.log('registering test svg')
window.customElements.define('test-svg', TestSvg)
