/**
* <div>
*   Last Name/Identifier: <input type="text" name="NAVpattern" size="10" >
*   First Name: <input type="text" name="NAVfirstName" size="10" >
*   <button>GO</button>
* </div>
*/
import { html, svg } from 'lit-html'
import { withComponent } from 'skatejs/dist/esnext'
import withLitHtml from '@skatejs/renderer-lit-html/dist/esnext'
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'

class ByuPersonLookup extends withComponent(withLitHtml(HTMLElement)) {
  constructor () {
    super()
    this.lastName = ''
    this.firstName = ''
    this.list = []
  }

  render() {
    const [iconH, iconW, , , iconPath] = faSearch.icon
    console.log({iconH, iconW, iconPath})
    const css=html`
      <style>
        :host {
          padding: 1rem;
          font-size: 1.1rem;
        }
        * {
         font-family: 'Gotham A', 'Gotham B', Helvetica Nue, Helvetica, sans-serif; 
        }
        input[type="search"] {
          padding: 0.3rem;
          border: thin solid #333333;
          border-radius: 0.2rem;
          margin-right: 0.2rem;
        }
        button {
          padding: 0.3rem;
          border: thin solid #333333;
          border-radius: 0.2rem;
          background-color: #2d83d9;
          color: white;
          margin-left: 0.4rem;
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
    const icon = svg`
    <svg alt="Search" width="14" height="14" viewBox="0 0 512 512">
    <path d$="${iconPath}" fill="white"/>
    </svg>
    `
    const renderRow = row => html`
                <tr>
                    <td>${row.name}</td>
                    <td>${row.byuId}</td>
                    <td>${row.netId}</td>
                </tr>
    `

    const searchResults = html`
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>BYU ID</th>
                    <th>Net ID</th>
                </tr>
            </thead>
            <tbody>
                ${this.list.map(r => renderRow(r))}
            </tbody>
        </table>
    `

    return html`
    ${css}
    <div>
      Last Name/Identifier:
    <input type="search" size="12" on-search="${this.search}" value="${this.lastName}" on-input="${(e) => this.lastNameChange(e)}">
      First Name:
    <input type="search" size="12" on-search="${this.search}" value="${this.firstName}" on-input="${(e) => this.firstNameChange(e)}">
    <button on-click="${(e) => this.search(e)}">
        ${icon}
      </button>
    </div>
        ${searchResults}
    `
  }

  lastNameChange (e) {
    this.lastName = e.target.value
    console.log(`last: ${this.lastName}, first: ${this.firstName}`)
  }

  firstNameChange (e) {
    this.firstName = e.target.value
    console.log(`last: ${this.lastName}, first: ${this.firstName}`)
  }

  search () {
    console.log(`last: ${this.lastName}, first: ${this.firstName}`)
    const f = this.firstName
    const l = this.lastName
    this.list = ['', '','','','','','','','','','','','','','','','','','','']
    .map((v, i) => {
      return {
        name: `${l}, ${f} ${i}`,
        byuId: (Math.random() * 1000000000).toFixed(0),
        netId: `${f.concat(l).substr(0, 4).concat((Math.random() * 100000).toFixed(0).substr(0,2))}`
      }
    })
    this.updated()
  }

}

customElements.define('byu-person-lookup', ByuPersonLookup);
