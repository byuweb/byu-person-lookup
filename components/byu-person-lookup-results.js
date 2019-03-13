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

import { LitElement, html, css, svg } from '@polymer/lit-element'
import faTimes from '@fortawesome/fontawesome-free-solid/faTimes'
import faEnvelope from '@fortawesome/fontawesome-free-solid/faEnvelope'
import faPhone from '@fortawesome/fontawesome-free-solid/faPhone'
import faHome from '@fortawesome/fontawesome-free-solid/faHome'

const { IntersectionObserver, CustomEvent } = window

export default class ByuPersonLookupResults extends LitElement {
  static get properties () {
    return {
      results: { type: Array },
      context: { type: String },
      noAutoselect: { type: Boolean },
      searchPending: { type: Boolean }
    }
  }

  static get styles () {
    return [css`
      :host {
        display: block;
      }
      :host[hidden] {
        display: none;
      }
      * {
        font-family: 'HCo Ringside Narrow SSm', Arial Narrow, Arial, sans-serif;
      }
      .modal {
        z-index: 98;
        background-color: rgba(0, 0, 0, 0.6);
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
      }
      .results {
        z-index: 99;
        position: fixed;
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
        position: fixed;
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
      svg.placeholder { filter: blur(1px); width: 18rem; height: 6rem; }
      tr.placeholder svg.placeholder { width: 100%; max-height: 1rem; }
      svg.placeholder rect {
        animation: pulse 1000ms ease-in-out infinite alternate;
      }
      @keyframes pulse {
        from { fill: #999999; }
        70% { fill: #999999; }
        to { fill: #B3B5B7; }
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
          grid-column: 1/-1;
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
    `]
  }

  constructor () {
    super()
    this.results = null
    this.context = 'directory'
    this.noAutoselect = false
    this.searchPending = false
    this.isObserving = false
  }

  updated (changedProperties) {
    /*
     * changedProperties.forEach((oldValue, propName) => {
     *   console.log(`lookup-results::property changed!
     *     ${propName}: '${oldValue}' => '${this[propName]}'`)
     * })
     */
    if (this.results && this.results.length === 1 && !this.noAutoselect) {
      // Do Autoselect
      return this.select(this.results[0])
    }
    if (this.results && this.results.length > 0 && !this.isObserving) {
      // console.log('lookup-results::set up intersection observer')
      const top = this.shadowRoot.getElementById('top')
      const bottom = this.shadowRoot.getElementById('bottom')
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
      // console.log('lookup-results::observing!', bottom)
      observer.observe(bottom)
      this.isObserving = true
    }
  }

  render () {
    // console.log(`byu-person-lookup-results::_render::searchPending=${searchPending}`)

    const renderPlaceholderRows = () => [1, 2, 3, 4, 5, 6].map(() => html`
      <tr class="placeholder"><td colspan="5">
        <svg class="placeholder" viewBox="0 0 100 5" preserveAspectRatio="none">
          ${svg`<rect x="1" y="1" width="98" height="3" fill="#999999"></rect>`}
        </svg>
      </td></tr>
    `)

    const renderPlaceholderCards = () => [1, 2, 3, 4, 5, 6].map(() => html`
      <div class="card placeholder">
        <svg class="placeholder" viewBox="0 0 50 40" preserveAspectRatio="none">
          <rect x="1" y="1" width="40" height="15" fill="#999999"></rect>
          <rect x="1" y="25" width="45" height="5" fill="#999999"></rect>
          <rect x="1" y="33" width="30" height="5" fill="#999999"></rect>
        </svg>
        <svg class="placeholder" viewBox="0 0 50 40" preserveAspectRatio="none">
          <rect x="1" y="17" width="45" height="5" fill="#999999"></rect>
          <rect x="1" y="25" width="30" height="5" fill="#999999"></rect>
          <rect x="1" y="33" width="35" height="5" fill="#999999"></rect>
        </svg>
      </div>
    `)

    const renderAddress = address => html`
      <ul>
        ${address.map(line => html`<li>${line}</li>`)}
      </ul>
    `

    const renderAdminRow = row => html`
      <tr @click=${e => this.select(row)}>
        <td>${row.name}</td>
        <td>${row.byuId}</td>
        <td>${row.netId}</td>
        <td>${row.employeeType}</td>
        <td>${row.studentStatus}</td>
      </tr>
    `

    const renderEmployeeInfo = row => {
      if (
        /ACT|LEV/.test(row.employeeType) ||
        (row.employeeType === '' && row.jobTitle && row.department)
      ) {
        return html`
          <div>
            <div>${row.jobTitle}</div>
            <div>${row.department}</div>
            <div>${row.addresses ? row.addresses.work ? renderAddress(row.addresses.work) : '' : ''}</div>
          </div>
        `
      }
      return html`<div></div>`
    }

    const [, , , , envelopeIconPath] = faEnvelope.icon
    const [, , , , phoneIconPath] = faPhone.icon
    const [, , , , homeIconPath] = faHome.icon
    const [, , , , closeIconPath] = faTimes.icon
    const closeIcon = svg`
    <path d=${closeIconPath} fill="white" transform="translate(90)"/>
    `
    const renderIcon = path => html`
      <svg width="14" height="14" viewBox="0 0 512 512">
        ${svg`<path d=${path} fill="#666666"/>`}
      </svg>
    `

    const renderDirectoryCard = row => html`
      <div class="card" @click=${e => this.select(row)}>
        <h3>${row.name}</h3>
        ${renderEmployeeInfo(row)}
        <div class="contact">
          <div>${renderIcon(envelopeIconPath)}${row.email}</div>
          <div>${renderIcon(phoneIconPath)}${row.phone}</div>
          <div>${renderIcon(homeIconPath)}${row.addresses ? row.addresses.mailing ? renderAddress(row.addresses.mailing) : '' : ''}</div>
        </div>
      </div>
    `
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
          ${this.searchPending ? renderPlaceholderRows() : ''}
        </tbody>
      </table>
    `

    const renderDirectory = results => html`
      <div class="deck">
        ${results.map(r => renderDirectoryCard(r))}
        ${this.searchPending ? renderPlaceholderCards() : ''}
      </div>
    `

    if (!this.results || !this.results.map || this.results.length < 1) {
      return html``
    }

    return html`
      <div class="modal">
        <div class="results">
          <h2 id="top">Lookup Results</h2>
          ${this.context && this.context === 'admin' ? renderAdmin(this.results) : renderDirectory(this.results)}
          <div class="spacer"></div>
          ${IntersectionObserver
    ? html`<button id="bottom" class="nav-btn" @click=${this.close}>Close</button>`
    : html`<div>
             <button class="nav-btn" @click=${this.prev}>Prev</button>
             <button class="nav-btn" @click=${this.next}>Next</button>
           </div>`}
        </div>
        <button class="close-modal" @click=${e => this.close()}>
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
    const { personId, byuId, netId, name } = row
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
    this.isObserving = false
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
}

