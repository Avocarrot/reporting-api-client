/*jshint node:true */
/*jshint expr:true */
/*jshint undef:false */

var expect = require('chai').expect;
var mocha = require('mocha');
var describe = mocha.describe;
var it = mocha.it;
var beforeEach = mocha.beforeEach;
var afterEach = mocha.afterEach;
var sinon = require('sinon');

var Mocks = require('../mocks');
var ReportingAPIClient = require('../index').ReportingAPIClient;
var _toConsumableArray = require('../index')._toConsumableArray;
var _extractResponseResult = require('../index')._extractResponseResult;

describe('Unit: Utils - ReportingAPIClient', function() {

  var sandbox;
  var HOST = 'http://reporting.mock.com/v1';

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  /**
   * Constructor
   */
  it('is an instance of ReportingAPIClient', function() {
    var client = new ReportingAPIClient({host: HOST});
    expect(client).to.be.instanceof(ReportingAPIClient);
  });

  /**
   * setCredentials()
   */
  it('setCredentials() sets access_token and url credentials', function() {
    var client = new ReportingAPIClient({host: HOST});
    client.setCredentials('/inventory', 123456789);
    expect(client.access_token).to.equal(123456789);
    expect(client.basePath).to.equal('/inventory');
  });

  /**
   * getFromEndpoint()
   */
  describe('getFromEndpoint()', function() {

    it('sends the correct request data', function(done) {
      var transformStub = sandbox.stub().returns(function(data) {return data;});
      var options = {
        caller: 'totals',
        query: {
          granularity: 'all',
          filters: {
            'app_id': 12345,
            'timestamp[from]': '2016-01-07T00:00:00.000Z',
            'timestamp[to]': '2016-01-08T00:00:00.000Z'
          }
        }
      };
      // Stub HTTP request
      var client = new ReportingAPIClient({
        host: HOST,
        xhrRequest: function(options, cb) {
          expect(options.url).to.equal('http://reporting.mock.com/v1/inventory/?granularity=all&filters%5Bapp_id%5D=12345&filters%5Btimestamp%5Bfrom%5D%5D=2016-01-07T00%3A00%3A00.000Z&filters%5Btimestamp%5Bto%5D%5D=2016-01-08T00%3A00%3A00.000Z&access_token=123456789');
          return cb(null, {
            statusCode: 200
          }, '{}');
        }
      });
      // Send xhr request
      client.resource = 'inventory';
      client.setCredentials('inventory', 123456789);
      client.getFromEndpoint(options, transformStub).then(function() {
        expect(transformStub.calledOnce).to.be.true;
        done();
      }).catch(err => console.error(err));
    });

    it('extracts errorMessage from error response', function(done) {
      // Mock HTTP request
      var client = new ReportingAPIClient({
        host: HOST,
        xhrRequest: function(options, cb) {
          return cb(null, {statusCode: 400}, JSON.stringify(Mocks.UNAUTHORIZED));
        }
      });
      // Send xhr request
      client.resource = 'inventory';
      client.getFromEndpoint().catch(function([error, errorMessage]) {
        expect(errorMessage).to.equal('Missing Authorization header from request');
        done();
      });
    });

    it('calls .abort() on previous XHR call', function(done) {
      // Setup spies
      var abortSpy = sandbox.spy();
      // Mock HTTP request
      var client = new ReportingAPIClient({
        host: HOST,
        xhrRequest: function(options, cb) {
          return cb(null, {statusCode: 204}, '{}');
        }
      });
      client.abort = abortSpy;
      // Send xhr request
      client.resource = 'inventory';
      client.getFromEndpoint({
        caller: 'foo'
      }, function(data) {
        return data;
      }).then(function() {
        expect(abortSpy.calledOnce).to.be.true;
        expect(abortSpy.getCall(0).args[0]).to.equal('foo');
        done();
      });
    });
  });

  /**
   * abort(caller)
   */
  it('abort(caller) aborts and clears registed XHR tasks for a caller', function() {
    var abortSpy = sandbox.spy();
    // Mock HTTP request
    var client = new ReportingAPIClient({host: HOST});
    client.requests.foo = {
      abort: abortSpy
    };
    // Abort foo XHR request
    client.abort('foo');
    // Assert expected state
    expect(abortSpy.calledOnce).to.be.true;
    expect(client.requests.foo).to.not.exist;
  });

  /**
   * tearDown()
   */
  it('tearDown() clears all registed XHR tasks', function() {
    var fooAbortSpy = sandbox.spy();
    var barAbortSpy = sandbox.spy();
    // Mock HTTP request
    var client = new ReportingAPIClient({host: HOST});
    // Setup XHR tasks
    client.requests.foo = {
      abort: fooAbortSpy
    };
    client.requests.foo = {
      abort: barAbortSpy
    };
    client.requests.bar = {
      abort: fooAbortSpy
    };
    expect(client.requests.foo).to.exist;
    expect(client.requests.bar).to.exist;
    // Drop all XHR tasks
    client.tearDown();
    // Assert new states
    expect(fooAbortSpy.calledOnce).to.be.true;
    expect(barAbortSpy.calledOnce).to.be.true;
    expect(client.requests.foo).to.not.exist;
    expect(client.requests.bar).to.not.exist;
  });

  /**
   * getTotals()
   */
  describe('getTotals() ', function() {
    var properties = {
      timestamp: {
        'from': '2016-01-07T00:00:00.000Z',
        'to': '2016-01-08T00:00:00.000Z'
      },
      filters: {
        'app_id': [12345]
      },
      granularity: null,
      group: null
    };

    it('calls .getFromEndpoint() with correct parameters', function() {
      // Mock HTTP request
      var client = new ReportingAPIClient({host: HOST});
      var getFromEndpointSpy = sandbox.spy();
      client.resource = 'inventory';
      client.getFromEndpoint = getFromEndpointSpy;
      client.getTotals([properties]);
      expect(getFromEndpointSpy.calledOnce).to.be.true;
      expect(getFromEndpointSpy.getCall(0).args[0]).to.eql({
        caller: 'totals',
        query: {
          granularity: 'all',
          timestamp: properties.timestamp,
          filters: properties.filters
        }
      });
    });
  });

  /**
   * transformTotals()
   */
  it('transformTotals() transforms totals response data ', function() {
    var client = new ReportingAPIClient({host: HOST});
    var actual = client.transformTotals(Mocks.TOTALS_DATA);
    expect(actual).to.eql({
      "metrics": {
        "auctions": {
          "label": "auctions",
          "value": 399522571
        },
        "ctr": {
          "label": "ctr",
          "value": 0.008512382938437556
        }
      }
    });
  });

  /**
   * getGroupped()
   */
  describe('getGroupped()', function() {
    it('calls .getFromEndpoint() with correct parameters', function(done) {
      // Setup client
      var client = new ReportingAPIClient({host: HOST});
      var properties = {
        timestamp: {
          'from': '2016-01-07T00:00:00.000Z',
          'to': '2016-01-08T00:00:00.000Z'
        },
        granularity: 'hour',
        group: {
          sortId: 'auctions',
          pruneSizes: [
            100, 10, 1
          ],
          groups: ['app_id', 'placement_type']
        },
        filters: {
          'os': ['Android']
        }
      };
      var transformFn = client.transformGroupped(properties.group.groups);
      // Stub getFromEndpoint calls
      var getFromEndpointSpy = sandbox.stub();
      getFromEndpointSpy.onCall(0).returns(Promise.resolve(transformFn(Mocks.BREAKDOWN_DATA_SPLIT_1)));
      getFromEndpointSpy.onCall(1).returns(Promise.resolve(transformFn(Mocks.BREAKDOWN_DATA_SPLIT_2)));
      // Setup client
      client.resource = 'inventory';
      client.getFromEndpoint = getFromEndpointSpy;
      // Call getBreakdown
      client.getGroupped(properties, 'caller').then(function(data) {
        // Assert expected state
        expect(getFromEndpointSpy.callCount).to.equal(2);
        expect(getFromEndpointSpy).to.be.calledTwice;
        expect(getFromEndpointSpy.getCall(0).args[0].query.filters).to.eql({"os": ["Android"]});
        expect(getFromEndpointSpy.getCall(1).args[0].query.filters).to.eql({
          "app_id": [
            "10002", "10001"
          ],
          "os": ["Android"]
        });
        expect(data).to.be.instanceof(Object);
        expect(data.children).to.be.a('array').with.length(2);
        done();
      }).catch(err => console.error(err));
    });

    it('calls .getFromEndpoint() with correct parameters for granularity', function(done) {
      // Setup client
      var client = new ReportingAPIClient({host: HOST});
      var properties = {
        timestamp: {
          'from': '2016-01-07T00:00:00.000Z',
          'to': '2016-01-08T00:00:00.000Z'
        },
        granularity: 'hour',
        group: {
          sortAscending: true,
          sortId: 'auctions',
          pruneSizes: [
            100, 10, 1
          ],
          groups: ['app_id', 'granularity']
        },
        filters: {}
      };
      var transformFn = client.transformGroupped(properties.group.groups);
      // Stub getFromEndpoint calls
      var getFromEndpointSpy = sandbox.stub();
      getFromEndpointSpy.onCall(0).returns(Promise.resolve(transformFn(Mocks.BREAKDOWN_DATA_SPLIT_1)));
      getFromEndpointSpy.onCall(1).returns(Promise.resolve(transformFn({})));
      // Setup client
      client.resource = 'inventory';
      client.getFromEndpoint = getFromEndpointSpy;
      // Call getGroupped
      client.getGroupped(properties, 'caller').then(function() {
        // Assert expected state
        expect(getFromEndpointSpy).to.be.calledTwice;
        expect(getFromEndpointSpy.getCall(0).args[0].query.group).to.eql(['app_id']);
        expect(getFromEndpointSpy.getCall(0).args[0].query.granularity).to.eql('all');
        expect(getFromEndpointSpy.getCall(1).args[0].query.group).to.eql(['app_id']);
        expect(getFromEndpointSpy.getCall(1).args[0].query.granularity).to.eql('hour');
        done();
      });
    });

    it('allows sorting by ascending order', function(done) {
      // Setup client
      var client = new ReportingAPIClient({host: HOST});
      var properties = {
        timestamp: {
          'from': '2016-01-07T00:00:00.000Z',
          'to': '2016-01-08T00:00:00.000Z'
        },
        granularity: 'hour',
        group: {
          sortAscending: true,
          sortId: 'auctions',
          pruneSizes: [
            100, 10, 1
          ],
          groups: ['app_id', 'granularity']
        },
        filters: {}
      };
      var transformFn = client.transformGroupped(properties.group.groups);
      // Stub getFromEndpoint calls
      var getFromEndpointSpy = sandbox.stub();
      getFromEndpointSpy.onCall(0).returns(Promise.resolve(transformFn(Mocks.BREAKDOWN_DATA_SPLIT_1)));
      getFromEndpointSpy.onCall(1).returns(Promise.resolve(transformFn({})));
      // Setup client
      client.resource = 'inventory';
      client.getFromEndpoint = getFromEndpointSpy;
      // Call getGroupped
      client.getGroupped(properties, 'caller').then(function(data) {
        // Assert expected order
        var firstChild = data.children[0].data.metrics;
        var secondChild = data.children[1].data.metrics;
        expect(firstChild.auctions).to.be.below(secondChild.auctions);
        done();
      });
    });
  });

  //
  /**
   * transformGroupped()
   */
  describe('transformGroupped()', function() {

    it('transforms breakdown response data ', function() {
      // Setup client
      var client = new ReportingAPIClient({host: HOST});
      var actual = client.transformGroupped(['app_id'])(Mocks.BREAKDOWN_DATA_SPLIT_1);
      expect(actual).to.have.length(2);
      expect(actual[0]).to.eql({
        "dimensions": {
          "app_id": {
            "label": "10001",
            "value": "10001"
          }
        },
        "metrics": {
          "auctions": 2621,
          "ctr": 0.3218881118881119
        }
      });
      expect(actual[1]).to.eql({
        "dimensions": {
          "app_id": {
            "label": "10002",
            "value": "10002"
          }
        },
        "metrics": {
          "auctions": 8121,
          "ctr": 0.3218881118881119
        }
      });
    });

    it('transforms breakdown response data for granularity', function() {
      // Setup client
      var client = new ReportingAPIClient({host: HOST});
      var actual = client.transformGroupped(['granularity'])(Mocks.BREAKDOWN_DATA_SPLIT_1);
      expect(actual).to.have.length(2);
      expect(actual[0]).to.eql({
        "dimensions": {
          "granularity": {
            "label": "2016-08-22T00:00:00.000Z",
            "value": "2016-08-22T00:00:00.000Z"
          }
        },
        "metrics": {
          "auctions": 2621,
          "ctr": 0.3218881118881119
        }
      });
      expect(actual[1]).to.eql({
        "dimensions": {
          "granularity": {
            "label": "2016-08-22T00:00:00.000Z",
            "value": "2016-08-22T00:00:00.000Z"
          }
        },
        "metrics": {
          "auctions": 8121,
          "ctr": 0.3218881118881119
        }
      });
    });

  });

  /**
   * getBreakdown()
   */
  describe('getBreakdown', function() {
    it('calls .getGroupped() with correct parameters', function() {
      // Setup client
      var client = new ReportingAPIClient({host: HOST});
      var getGrouppedSpy = sandbox.spy();
      client.getGroupped = getGrouppedSpy;
      // Call getBreakdown
      var properties = {
        'group': {
          'groups': ['country', 'app_id']
        }
      };
      client.getBreakdown([properties]);
      expect(getGrouppedSpy.calledOnce).to.be.true;
      expect(getGrouppedSpy.getCall(0).args).to.eql([
        {
          'group': {
            'groups': [
              'country', 'app_id'
            ],
            'pruneSizes': [50, 5, 5]
          }
        },
        'breakdown'
      ]);
    });
  });

  /**
   * getTimeseries()
   */

  it('getTimeseries() calls .getGroupped() with correct parameters', function() {
    // Setup client
    var client = new ReportingAPIClient({host: HOST});
    var getGrouppedSpy = sandbox.spy();
    client.getGroupped = getGrouppedSpy;
    // Call getTimeseries
    var properties = {
      'group': {
        'groups': ['granularity', 'app_id']
      }
    };
    client.getTimeseries([properties]);
    expect(getGrouppedSpy.calledOnce).to.be.true;
    expect(getGrouppedSpy.getCall(0).args).to.eql([
      {
        'group': {
          'groups': [
            'app_id', 'granularity'
          ], // Groups should ensure granularity to be the last group
          'pruneSizes': [50, null] // Prune size for granularity should be null
        }
      },
      'timeseries'
    ]);
  });

  /**
   * getDimension()
   */
  describe('getDimension()', function() {
    var properties = {
      timestamp: {
        'from': '2016-01-07T00:00:00.000Z',
        'to': '2016-01-08T00:00:00.000Z'
      },
      granularity: 'hour',
      group: ['os'],
      filters: {
        'app_id': [12345]
      }
    };

    it('calls .getFromEndpoint() with correct parameters', function() {
      // Setup client
      var client = new ReportingAPIClient({host: HOST});
      var getFromEndpointSpy = sandbox.spy();
      client.resource = 'inventory';
      client.getFromEndpoint = getFromEndpointSpy;
      client.getDimension([properties, 'app_id']);
      expect(getFromEndpointSpy.calledOnce).to.be.true;
      expect(getFromEndpointSpy.getCall(0).args[0]).to.eql({
        caller: 'dimensions',
        resource: 'dimensions/app_id',
        query: {
          granularity: 'hour',
          timestamp: properties.timestamp,
          filters: properties.filters
          // group was be ignored
        }
      });
    });
  });

  /**
   * transformDimension()
   */
  it('transformDimension() transforms dimension response data ', function() {
    // Setup client
    var client = new ReportingAPIClient({host: HOST});
    var actual = client.transformDimension('app_id')(Mocks.DIMENSIONS_DATA.APP_ID);
    expect(actual).to.eql([
      {
        "id": "5049",
        "data": "5049",
        "label": "5049"
      }, {
        "id": "6040",
        "data": "6040",
        "label": "6040"
      }, {
        "id": "2092",
        "data": "2092",
        "label": "2092"
      }, {
        "id": "6395",
        "data": "6395",
        "label": "6395"
      }
    ]);
  });

  /**
   * transformDimension()
   */
  it('generateLabelFor() generates label for tranform function', function() {
    // Setup client
    var transformLabelSpy = sandbox.spy();
    var client = new ReportingAPIClient({
      host: HOST,
      transformLabelFn: transformLabelSpy
    });
    client.generateLabelFor('foo', 'bar');
    expect(transformLabelSpy.callCount).to.equal(1);
    expect(transformLabelSpy.getCall(0).args).to.eql(['foo','bar']);
  });

  describe('_extractResponseResult(response)', function() {
    it('extracts valid result Object', function() {
      var resultObject = Object.create({'foo': 'bar'});
      expect(_extractResponseResult({
        data: [
          {
            result: resultObject
          }
        ]
      })).to.eql(resultObject);
    });

    it('ignores invalid result Object', function() {
      expect(_extractResponseResult({})).to.eql({});
    });

    it('result Object without data', function() {
      expect(_extractResponseResult({data: []})).to.eql({});
    });
  });

  describe('_toConsumableArray(Map)', function() {
    it('extracts Map to Array', function() {
      var items = new Map();
      items.set('foo', 1);
      items.set('bar', 2);
      expect(_toConsumableArray(items)).to.eql([
        [
          'foo', 1
        ],
        ['bar', 2]
      ]);
    });
    it('unwraps Array from Array', function() {
      var items = [['foo', 1], ['bar', 2]];
      expect(_toConsumableArray(items)).to.eql([
        [
          'foo', 1
        ],
        ['bar', 2]
      ]);
    });
  });
});
