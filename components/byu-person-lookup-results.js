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

class ByuPersonLookupResults extends LitElement {
  static get properties () {
    return {
      results: Array
      /* TODO: include search parameter type (person_id, home_town, etc..) */
    }
  }

  _render ({results}) {
    console.log(`results=${Array.isArray(results)}`)
    const css=html`
      <style>
        :host {
          padding: 1rem;
        }
        * {
         font-family: 'Gotham A', 'Gotham B', Helvetica Nue, Helvetica, sans-serif; 
        }
        table { border-collapse: collapse; }
        th {
          text-align: left;
          background-color: #333333;
          color: white;
        }
        th, td {
          padding: 0.5rem;
          border: 1px solid #333333;
        }
      </style>
    `
    const renderRow = row => html`
                <tr>
                    <td>${row.name}</td>
                    <td>${row.byuId}</td>
                    <td>${row.netId}</td>
                </tr>
    `

    return html`
      ${css}
      <table>
          <thead>
              <tr>
                  <th>Name</th>
                  <th>BYU ID</th>
                  <th>Net ID</th>
              </tr>
          </thead>
          <tbody>
              ${results && results.map ? results.map(r => renderRow(r)) : ''}
          </tbody>
      </table>
    `
  }

}

console.log('registering person lookup results')
window.customElements.define('byu-person-lookup-results', ByuPersonLookupResults)
