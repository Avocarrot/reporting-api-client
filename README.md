<img width="300" src="https://cloud.githubusercontent.com/assets/1907604/7618436/f8c371de-f9a9-11e4-8846-772f67f53513.jpg"/>

# reporting-api-client

[![CircleCI](https://circleci.com/gh/Avocarrot/reporting-api-client.svg?style=shield&circle-token=a289026f1ac89645d7996913c153d00d3a63edb7)](https://circleci.com/gh/Avocarrot/reporting-api-client)
[<img src="https://s3.amazonaws.com/avocarrot_various/git-shields/coverage-99%2B.svg"/>](https://circleci.com/api/v1/project/Avocarrot/reporting-api-client/latest/artifacts/0//home/ubuntu/rreporting-api-client/coverage/lcov-report/index.html)

A thin Avocarrot reporting API consumer

## Development

Please see the **[CONTRIBUTING instructions](https://github.com/Avocarrot/reporting-api-client/blob/master/CONTRIBUTING.md)** before contributing to this repository

---

## Getting Started

Install the required dependencies
```
make yarn
make npm
```

To build the library use

```
npm start
```


---

## Tests

To run the tests use

```
npm test
```
To produce a test coverage report use

```
npm run cov
```
You can access the report by running `open coverage/lcov-report/index.html`.

:arrow_forward: [Code coverage results for the latest build](
https://circleci.com/api/v1/project/Avocarrot/reporting-api-client/latest/artifacts/0//home/ubuntu/reporting-api-client/coverage/lcov-report/index.html)

---

## API Reference

To generate the [JSDoc](http://usejsdoc.org/) API Reference run
```
npm run docs
```
You can access the generated docs by running `open docs/index.html`

:arrow_forward: [API Reference for the latest build](
https://circleci.com/api/v1/project/Avocarrot/reporting-api-client/latest/artifacts/0//home/ubuntu/reporting-api-client/docs/index.html)

---

## Usage

### Setup

Initialize client
```javascript
/**
 * Initialize ReportingAPIClient
 */
var ReportingAPIClient = require('reporting-api-client');

var client = new ReportingAPIClient({
  host: 'http://reporting.avocarrot.com/v1'
});
```

Configure credentials
```javascript
/**
 * Set your credentials and resource to fetch data from
 *
 * @memberof ReportingAPIClient
 * @method setCredentials
 * @param {String} resource - The resource to fetch from
 * @param {String} access_token - The access token to use
 * @return {Void}
 */
client.setCredentials('<resource>', '<access_token>');
```

### Fetch data

Fetch totals

```javascript
/**
 * Returns totals from API
 *
 * @memberof ReportingAPIClient
 * @method getTotals
 * @param {Array} propertiesArray
 * @param {Object} propertiesArray[0] - properties: The configuration properties to use (timestamp, filters)
 * @return {Promise}
 */
client.getTotals([{
  timestamp: {
    from: '2016-01-07T00:00:00.000Z',
    to: '2016-01-08T00:00:00.000Z'
  },
  filters: {
    country: 'USA',
    // ...
  }
}]).then(function(data) {
  //...
});
```

Fetch breakdown

```javascript
/**
 * Returns breakdown data from Reporting API
 *
 * @memberof ReportingAPIClient
 * @method getBreakdown
 * @param {Array} propertiesArray
 * @param {Object} propertiesArray[0] - properties: The configuration properties to use (timestamp, filters, granularity, groups)
 * @return {Promise}
 */
client.getBreakdown([{
  timestamp: {
    from: '2016-01-07T00:00:00.000Z',
    to: '2016-01-08T00:00:00.000Z'
  },
  filters: {
    country: 'USA',
    // ...
  },
  group: {
    groups: ['country', 'platform'],
    // ...
  }
}]).then(function(data) {
  //...
});
```

Fetch timeseries

```javascript
/**
 * Returns timeseries from Reporting API
 *  - Granularity split should always be in the back of the splits queue
 *
 * @memberof ReportingAPIClient
 * @method getTimeseries
 * @param {Array} propertiesArray
 * @param {Object} propertiesArray[0] - properties: The configuration properties to use (timestamp, filters, granularity, groups)
 * @return {Promise}
 */
client.getBreakdown([{
  timestamp: {
    from: '2016-01-07T00:00:00.000Z',
    to: '2016-01-08T00:00:00.000Z'
  },
  filters: {
    country: 'USA',
    // ...
  },
  granularity: 'hour',
  group: {
    groups: ['granularity', 'platform'],
    // ...
  }
}]).then(function(data) {
  //...
});
```

---

## Versioning

For the versions available, see the [releases for this repository](https://github.com/Avocarrot/reporting-api-client/tags).
