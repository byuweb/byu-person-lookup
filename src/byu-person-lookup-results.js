import {LitElement, html} from '@polymer/lit-element'

class ByuPersonLookupResults extends LitElement {
  static get properties () {
    return {
      search: String,
      results: Object
      /* TODO: include search parameter type (person_id, home_town, etc..) */
    }
  }

  _render ({search, results}) {
    console.log(`search=${search}, results=${results}`)
    const [iconH, iconW, , , iconPath] = faSearch.icon
    console.log({iconH, iconW, iconPath})
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
              ${results ? results.map(r => renderRow(r)) : ''}
          </tbody>
      </table>
    `
  }

}

console.log('registering person lookup results')
window.customElements.define('byu-person-lookup-results', ByuPersonLookupResults)
