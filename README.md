# byu-person-lookup
A Web Component to look up a person, display a list of possible matches, and fire an event when a person is selected from a list.

## Demo Page
See a live demo at https://byuweb.github.io/byu-person-lookup/demo/

## Usage
To use this component, your website needs to do 3 things:
1. Import the person lookup component, and a compatible data source component.
1. Include an implementation of [BYU Browser Oauth](https://github.com/byuweb/byu-browser-oauth)
1. Use the component in your page, with a data source component as a child component.

### Import the components
First, import the `byu-person-lookup` component from the BYU CDN:
```html
<script type="module" src="https://cdn.byu.edu/byu-person-lookup/latest/byu-person-lookup-bundle.min.js"></script>
<script type="module" src="https://cdn.byu.edu/byu-person-lookup/latest/byu-personsv2-datasource-bundle.min.js"></script>
```

### Include a BYU Browser Oauth Implementation
The Personsv2 data source component requires an implementation of the [BYU Browser
Oauth](https://github.com/byuweb/byu-browser-oauth) library in order to access the [Persons v2
University API](https://api.byu.edu/store/apis/info?name=Persons&version=v2&provider=BYU%2Fjohnrb2).
Current implementations include [WABS](https://github.com/byu-oit/wabs-middleware) and
[byu-browser-oauth-implicit](https://github.com/byuweb/byu-browser-oauth-implicit).

### Use the component in your page
Include the component somewhere in your page, providing the data source component as a child:
```html
<byu-person-lookup>
    <byu-personsv2-datasource></byu-personsv2-datasource>
</byu-person-lookup>
```

## Configure the component
Option | Values | Default | Description
------ | ------ | ------- | -----------
`context` | `directory`, `admin` | `directory` | controls how the list of matching people is displayed. Valid values are `directory` (the default) which will display contact information, and `admin` which displays identifiers and student and employee statuses.
`compact` | | | If this attribute is present, the lookup component will render more compactly, removing white space and some text.
`no-autoselect` | | | If this attribute is present, the results will be shown even if there is an exact match.

## Selected event
When the user selects one of the people from the list, the component raises an event named
`byu-lookup-results-select`. The event detail contains:
```javascript
  detail: {
    personId,
    byuId,
    netId,
    name
  },
```

# Data source implementation
The lookup component and its data source are loosely coupled so that alternative data sources can be
easily used. For example, an admissions interface may wish to only search for people who have
submitted applications this semester.

In order to create a data source compatible with the lookup component, you must fire and listen on
certain events:
1. byu-lookup-datasource-register: The data source must fire this event when it's ready for
   interaction.
1. byu-lookup-datasource-searching: The data source fires this event when a search request has been
   initiated.
1. byu-lookup-datasource-error: The data source fires this event when a search request results in an
   error. The event detail should include a `message` to present to the user.
1. byu-lookup-datasource-result: The data source fires this event when it has fetched data. The
   event detail should have these fields (all fields aside from name, byuId, and netId can be omitted):
```javascript
[
  {
    addresses: {
      mailing: [/*address lines*/],
      work: [/*address lines*/],
      permanent: [/*address lines*/],
      residential: [/*address lines*/]
    },
    email: '',
    phone: '',
    name: '',
    byuId: '',
    netId: '',
    employeeType: '',
    department: '',
    jobTitle: '',
    studentStatus: ''
  },
  ...
]
```

You must also provide `performSearch`, `nextPage`, and `prevPage` methods to be called by the lookup
component:
```javascript
async function performSearch () {
  /* Implementation */
}

async function nextPage () {
  /* Implementation */
}

async function prevPage () {
  /* Implementation */
}
```

## Data Source Interaction.

The lookup component will update the `search` parameter of its data source as the user types in the
search box. The lookup component will also display any markup provided by the data source within a
label connected to the search box. You can use these features to provide a custom label for the
search box that can be updated as the user types.
