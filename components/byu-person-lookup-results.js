/*
 * Copyright 2018 Brigham Young University
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {LitElement, html} from '@polymer/lit-element'
import {svg} from 'lit-html/lib/lit-extended'
import faTimes from '@fortawesome/fontawesome-free-solid/faTimes'
import faEnvelope from '@fortawesome/fontawesome-free-solid/faEnvelope'
import faPhone from '@fortawesome/fontawesome-free-solid/faPhone'
import faHome from '@fortawesome/fontawesome-free-solid/faHome'

const {IntersectionObserver, CustomEvent} = window

export default class ByuPersonLookupResults extends LitElement {
  static get properties () {
    return {
      results: Array,
      context: String,
      searchPending: Boolean
    }
  }

  _render ({results, context, searchPending}) {
    // console.log(`byu-person-lookup-results::_render::searchPending=${searchPending}`)
    const css = html`
      <style>
        :host {
          padding: 1rem;
        }
    * {
      font-family: 'Gotham A', 'Gotham B', Helvetica Nue, Helvetica, sans-serif;
    }
    .modal {
      z-index: 98;
      background-color: rgba(0, 0, 0, 0.6);
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
    .results {
      z-index: 99;
      position: absolute;
      left: 0;
      right: 0;
      top: 20vh;
      bottom: 0;
      padding: 0.5rem;
      background-color: white;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto 1fr auto;
      grid-gap: 0.5rem;
      overflow: auto;
    }
    .close-modal {
      z-index: 100;
      position: absolute;
      right: 0;
      top: calc(20vh - 2rem);
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding: 0.3rem;
      border: 1px solid #5199E1;
      cursor: pointer;
      box-shadow: 0rem 0rem 1rem #5199E1;
    }
    h2 {
      margin: 0;
    }
    table {
      border-collapse: collapse;
    }
    th, td {
      padding: 0.5rem;
      border-bottom: 1px solid #666666;
    }
    th {
      text-align: left;
      background-color: #0057B8;
      color: white;
      padding: 1rem;
    }
    tbody tr { cursor: pointer; }
    tbody tr:nth-child(odd) {
      background-color: #E6E6E6;
    }
    tbody tr.placeholder { cursor: default; }
    ol, ul {
      margin: 0;
      padding: 0;
      display: inline-flex;
      flex-direction: column;
    }
    li {
      list-style-type: none;
      margin: 0;
    }
    .nav-btn {
      padding: 0.3rem 1rem;
      border: thin solid #666666;
      border-radius: 0.05rem;
      color: white;
      cursor: pointer;
      justify-self: start;
      align-self: center;
    }
    button {
      font-size: 1.1rem;
      background-color: #0057B8;
    }
    button:hover, button:active {
      box-shadow: inset 0 0 0.2rem rgba(255, 255, 255, 0.5);
      background-color: #5199E1;
    }
    .deck {
      display: grid;
      grid-template-columns: 1fr;
      grid-auto-rows: auto;
      grid-gap: 1rem;
    }
    .card {
      border: thin solid #666666;
      border-left: 0.5rem solid #002E5D;
      padding: 0.5rem;
      display: grid;
      grid-template-columns: 1fr;
      grid-auto-rows: auto;
      grid-gap: 0.5rem;
      cursor: pointer;
    }
    .card h3 {
      margin: 0;
    }
    .contact {
      display: flex;
      flex-direction: column;
    }
    .contact div {
      display: inline-grid;
      grid-template-columns: auto 1fr;
      grid-gap: 0.25rem;
    }
    .contact div svg {
      margin-top: calc(1rem - 14px);
    }
    .card.placeholder { cursor: default; }
    svg.placeholder { filter: blur(2px); }
    svg.placeholder line {
      animation: pulse 1500ms ease-in-out infinite alternate;
    }
    @keyframes pulse {
      from { stroke: #999999; }
      to { stroke: #CCCCCC; }
    }
    @media only screen and (min-width: 650px) {
      .deck {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(28rem, 1fr));
        grid-auto-rows: auto;
        grid-gap: 1rem;
      }
      .card {
        border: thin solid #666666;
        border-left: 0.5rem solid #002E5D;
        padding: 0.5rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        grid-gap: 0.5rem;
        cursor: pointer;
      }
      .card h3 {
        margin: 0;
        grid-column: 1/3;
      }
    }
    @media only screen and (min-width: 900px) {
      .results {
        left: 10vw;
        right: 10vw;
        top: 10vh;
        max-height: 85vh;
      }
      .close-modal {
        right: calc(10vw - 2rem);
        top: calc(10vh - 2rem);
      }
    }
  </style>
`

    const renderPlaceholder = () => html`
      <svg class="placeholder" viewBox="0 0 100 3" preserveAspectRatio="none">
        <line x1="5" x2="95" y1="1.5" y2="1.5" stroke="#666666" />
      </svg>
    `
    const renderAddress = address => html`
      <ul>
        ${address.map(line => html`<li>${line}</li>`)}
      </ul>
    `
    const renderAdminRow = row => html`
      <tr on-click="${e => this.select(row)}">
        <td>${row.name}</td>
        <td>${row.byuId}</td>
        <td>${row.netId}</td>
        <td>${row.employeeType}</td>
        <td>${row.studentStatus}</td>
      </tr>
    `
    const renderPlaceholderRows = () => [1, 2, 3, 4, 5].map(() => html`
      <tr class="placeholder"><td colspan="5">${renderPlaceholder()}</td></tr>
    `)

    const renderEmployeeInfo = row => {
      if (/ACT|LEV/.test(row.employeeType)) {
        return html`
          <div>
            <div>${row.jobTitle}</div>
            <div>${row.department}</div>
            <div>${row.addresses.work ? renderAddress(row.addresses.work) : ''}</div>
          </div>
        `
      }
      return html`<div></div>`
    }

    const [, , , , envelopeIconPath] = faEnvelope.icon
    const [, , , , phoneIconPath] = faPhone.icon
    const [, , , , homeIconPath] = faHome.icon
    const renderIcon = path => html`
      <svg width="14" height="14" viewBox="0 0 512 512">
        ${svg`<path d$="${path}" fill="#666666"/>`}
      </svg>
    `

    const renderDirectoryCard = row => html`
      <div class="card" on-click="${e => this.select(row)}">
        <h3>${row.name}</h3>
        ${renderEmployeeInfo(row)}
        <div class="contact">
          <div>${renderIcon(envelopeIconPath)}${row.email}</div>
          <div>${renderIcon(phoneIconPath)}${row.phone}</div>
          <div>${renderIcon(homeIconPath)}${row.addresses.mailing ? renderAddress(row.addresses.mailing) : ''}</div>
        </div>
      </div>
    `
    const renderPlaceholderCards = () => [1, 2, 3, 4, 5].map(() => html`
      <div class="card placeholder">
        <h3>${renderPlaceholder()}</h3>
        <div>
          <div>${renderPlaceholder()}</div>
          <div>${renderPlaceholder()}</div>
        </div>
        <div>
          <div>${renderPlaceholder()}</div>
          <div>${renderPlaceholder()}</div>
          <div>${renderPlaceholder()}</div>
        </div>
      </div>
    `)

    const renderAdmin = results => html`
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>BYU ID</th>
            <th>Net ID</th>
            <th>EMP Type</th>
            <th>STD Status</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => renderAdminRow(r))}
          ${searchPending ? renderPlaceholderRows() : ''}
        </tbody>
      </table>
    `

    const renderDirectory = results => html`
      <div class="deck">
        ${results.map(r => renderDirectoryCard(r))}
        ${searchPending ? renderPlaceholderCards() : ''}
      </div>
    `

    if (!results || !results.map || results.length < 1) {
      return html``
    }

    const [, , , , closeIconPath] = faTimes.icon
    const closeIcon = svg`
    <path d$=${closeIconPath} fill="white" transform="translate(90)"/>
    `

    return html`
      ${css}
      <div class="modal">
        <div class="results">
          <h2 id="top">Lookup Results</h2>
          ${context && context === 'admin' ? renderAdmin(results) : renderDirectory(results)}
          <div class="spacer"></div>
          ${IntersectionObserver
    ? html`<button id="bottom" class="nav-btn" on-click="${e => this.close()}">Close</button>`
    : html`
              <div>
                <button class="nav-btn" on-click="${e => this.prev()}">Prev</button>
                <button class="nav-btn" on-click="${e => this.next()}">Next</button>
              </div>
            `
}
        </div>
        <button class="close-modal" on-click="${e => this.close()}">
          <svg alt="Search" width="24" height="24" viewBox="0 0 512 512">
            ${closeIcon}
          </svg>
        </button>
      </div>
    `
  }

  dispatch (type, detail) {
    const options = detail
      ? { detail, bubbles: true, composed: true }
      : { bubbles: true, composed: true }
    const evt = new CustomEvent(type, options)
    this.dispatchEvent(evt)
  }

  select (row) {
    const {personId, byuId, netId, name} = row
    this.dispatch('byu-lookup-results-select', {
      personId,
      byuId,
      netId,
      name
    })
    this.close()
  }

  close () {
    this.dispatch('byu-lookup-results-close')
  }

  next () {
    if (this.searchPending) {
      return
    }
    this.dispatch('byu-lookup-next-page')
  }

  prev () {
    if (this.searchPending) {
      return
    }
    this.dispatch('byu-lookup-prev-page')
  }

  _didRender () {
    const top = this._root.getElementById('top')
    const bottom = this._root.getElementById('bottom')
    if (!IntersectionObserver || !top || !bottom) {
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return
        }
        if (entry.target === bottom) {
          // console.log(`IntersectionObserver::callback:nextPage`)
          this.next()
        } else if (entry.target === top) {
          // console.log(`IntersectionObserver::callback:prevPage`)
          this.prev()
        }
      })
    }, {})
    // observer.observe(top)
    observer.observe(bottom)
  }
}

/*
console.log('registering person lookup results')
window.customElements.define('byu-person-lookup-results', ByuPersonLookupResults)
*/
