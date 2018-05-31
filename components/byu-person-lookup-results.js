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

export default class ByuPersonLookupResults extends LitElement {
  static get properties () {
    return {
      results: Array,
      context: String
    }
  }

  _render ({results, context}) {
    console.log(`results=${Array.isArray(results)}`)
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
          grid-auto-rows: auto;
          grid-gap: 0.5rem;
          overflow-y: auto;
        }
        table { border-collapse: collapse; }
        th {
          text-align: left;
          background-color: #333333;
          color: white;
        }
        tr { cursor: pointer; }
        th, td {
          padding: 0.5rem;
          border-bottom: 1px solid #333333;
        }
        button {
          font-size: 1.1rem;
          padding: 0.3rem 0.7rem;
          border: thin solid #333333;
          border-radius: 0.2rem;
          background-color: #1e61a4;
          color: white;
          cursor: pointer;
          justify-self: center;
          align-self: center;
        }
        @media only screen and (min-width: 900px) {
          .results {
            left: 10vw;
            right: 10vw;
            top: 10vh;
            max-height: 85vh;
          }
        }
      </style>
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

    const renderDirectoryRow = row => html`
      <tr on-click="${e => this.select(row)}">
        <td>${row.name}</td>
        <td>${row.addresses.mailing ? renderAddress(row.addresses.mailing) : ''}</td>
        <td>${row.email}</td>
      </tr>
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
          ${results && results.map ? results.map(r => renderAdminRow(r)) : ''}
        </tbody>
      </table>
    `

    const renderDirectory = results => html`
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          ${results && results.map ? results.map(r => renderDirectoryRow(r)) : ''}
        </tbody>
      </table>
    `

    if (!results || results.length < 1) {
      return html``
    }
    return html`
      ${css}
      <div class="modal">
        <div class="results">
          ${context && context === 'admin' ? renderAdmin(results) : renderDirectory(results)}
          <button on-click="${e => this.close()}">Close</button>
        </div>
      </div>
    `
  }

  select (row) {
    const {personId, byuId, netId, name} = row
    const evt = new CustomEvent('byu-lookup-results-select', {
      detail: {
        personId,
        byuId,
        netId,
        name
      },
      bubbles: true,
      composed: true
    })
    this.dispatchEvent(evt)
    this.dispatchEvent(new CustomEvent('byu-lookup-results-close'))
  }

  close () {
    this.dispatchEvent(new CustomEvent('byu-lookup-results-close'))
  }
}

console.log('registering person lookup results')
window.customElements.define('byu-person-lookup-results', ByuPersonLookupResults)
