/*jshint node:true */
'use strict';

var param = require('jquery-param');
var xhr = require('xhr');
var Set = require('core-js/library/fn/set');
var from = require('core-js/library/fn/array/from');
var Promise = require('promise');
var Map = require('core-js/library/fn/map');

/**
 * Converts object to consumable array
 *
 * @function _toConsumableArray
 * @param {Array} arr
 * @ignore
 */
function _toConsumableArray(obj) {
  if (Array.isArray(obj)) {
    for (var i = 0, obj2 = Array(obj.length); i < obj.length; i++) {
      obj2[i] = obj[i];
    }
    return obj2;
  } else {
    return from(obj);
  }
}
exports._toConsumableArray = _toConsumableArray;

/**
 * Extracts result field from response
 *
 * @function _extractResponseResult
 * @param {Object} response
 * @return {Object}
 */
function _extractResponseResult(response) {
  if (!response || !response.data) {
    return {};
  }
  return (response.data.pop() || {}).result || {};
}
exports._extractResponseResult = _extractResponseResult;

/**
 * @class SortableTree
 * @constructor
 * @param {Object} data
 */
var SortableTree = function(data) {
  this.data = data || null;
  this.children = new Map();
};

/**
 * Registers child in children Map
 *
 * @memberof SortableTree
 * @method addChild
 * @param {Object} data
 * @param {String} key
 * @param {Array} pathKeys
 * @return {Void}
 */
SortableTree.prototype.addChild = function(data, key, pathKeys) {
  /**
   * Returns parent where the child should be added
   *
   * @function _findParent
   * @ignore
   * @param {SortableTree} node - The root node to use
   * @param {Array} currentKeys - The list of node keys to use for the lookup
   * @return {SortableTree}
   */
  var _findParent = function(node, currentKeys) {
    var currentKey = currentKeys.shift();
    var children = node.children;
    if (!children.has(currentKey)) {
      return node;
    }
    return _findParent(children.get(currentKey), currentKeys);
  };
  // Create clone of keys to use
  pathKeys = (pathKeys || []).slice(0);
  // Map null values to  to "null" (String)
  key = key || "null";
  // Store and return new child
  var child = new SortableTree(data);
  _findParent(this, pathKeys).children.set(key, child);
  return child;
};

/**
 * Sorts children in descending order using an order function
 *
 * @memberof SortableTree
 * @method pruneBy
 * @param {Function} sortFunc - The function to use for sorting
 * @param {Array} sizes - The list of sizes to prune for each iteration (level)
 * @return {Void}
 */
SortableTree.prototype.pruneBy = function(sortFunc, sizes) {
  var size = sizes.shift();
  var children = this.children;
  if (!children.size) {
    return;
  }
  // Construct new sorted children array
  var sortedChildren = [].concat(_toConsumableArray(this.children)).sort(function(a, b) {
    return sortFunc(a[1].data, b[1].data);
  });
  // Prune children
  var pruneSize = (size !== null && children.size > size) ? size : children.size;
  this.children = new Map(sortedChildren.slice(0, pruneSize));
  // Sort children
  children.forEach(function(child) {
    child.pruneBy(sortFunc, sizes.slice(0));
  });
  return this;
};

/**
 * Flattens nodes into an array
 *
 * @memberof SortableTree
 * @method flatten
 * @return {Array}
 */
SortableTree.prototype.flatten = function() {
  var children = this.children;
  var data = this.data;
  return Array.from(children, function(child) {
    return child[1];
  }).reduce(function(prev, next) {
    return prev.concat(next.flatten());
  }, [data]).filter(function(item) {
    return item !== null;
  });
};

/**
 * Converts children to arrays
 *
 * @memberof SortableTree
 * @method mapToArray
 * @return {Array}
 */
SortableTree.prototype.mapToArray = function() {

  var obj = Object.assign({data: this.data});
  obj.children = [].concat(_toConsumableArray(this.children)).map(function(childArray) {
    return childArray[1].mapToArray();
  });
  return obj;
};

exports.SortableTree = SortableTree;

/**
 * Initializes a ReportingAPIClient instance
 *
 * @class ReportingAPIClient
 * @constructor
 * @param {Object} options - The configuration options to use
 * @return {ReportingAPIClient}
 */
function ReportingAPIClient(options) {
  this.host = options.host;
  this.xhrRequest = options.xhrRequest || xhr;
  this.transformLabelFn = options.transformLabelFn;
  this.resource = null;
  this.access_token = null;
  this.requests = {};
}

/**
 * Generates label for key
 *
 * @memberof ReportingAPIClient
 * @method generateLabelFor
 * @param {String} key
 * @param {String} value
 * @return {String}
 */
ReportingAPIClient.prototype.generateLabelFor = function(key, value) {
  if (this.transformLabelFn instanceof Function) {
    return this.transformLabelFn(key, value);
  }
  if (!value) {
    return key;
  }
  return value;
};

/**
 * Configures ReportingAPIClient instance
 *
 * @memberof ReportingAPIClient
 * @method setCredentials
 * @param {String} resource - The resource to fetch from
 * @param {String} access_token - The access token to use
 * @return {Void}
 */
ReportingAPIClient.prototype.setCredentials = function(resource, access_token) {
  this.resource = resource;
  this.access_token = access_token;
};

/**
 * Retrieves data from a ReportingAPI endpoint
 *
 * @memberof ReportingAPIClient @method getFromEndpoint
 * @param {Object} options - The configuration options to use
 * @param {Function} transform - The function to use for transformation
 * @return {Promise} promise
 */
ReportingAPIClient.prototype.getFromEndpoint = function(options, transform) {
  options = options || {};
  var caller = options.caller || 'fromEndpoint';
  var query = options.query || {};
  query.access_token = this.access_token;
  // Abort previous request
  this.abort(caller);
  // Send new request
  var _self = this;
  var url = this.host + '/' + this.resource + '?' + param(query);
  return new Promise(function(resolve, reject) {
    _self.requests[caller] = _self.xhrRequest({
      url: url,
      method: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      crossDomain: true,
      processData: false,
      headers: {
        'X-View-Caller': caller
      }
    }, function(err, resp, body){
      setTimeout(function() {
        delete _self.requests[caller];
      }, 1);
      if (resp.statusCode >= 400) {
        var errorMessage = JSON.parse(body).errors.pop().message;
        return reject([err, errorMessage]);
      }
      return resolve(transform(JSON.parse(body)));
    });
  });
};

/**
 * Transforms totals response
 *
 * @memberof ReportingAPIClient @method transformTotals
 * @param {Object} response - The response object to consume
 * @return {Object}
 */
ReportingAPIClient.prototype.transformTotals = function(response) {
  var _self = this;
  var result = _extractResponseResult(response);
  var metrics = Object.keys(result).reduce(function(obj, key) {
    obj[key] = {
      'value': result[key],
      'label': _self.generateLabelFor(key)
    };
    return obj;
  }, {});
  return {metrics: metrics};
};

/**
 * Returns totals from API
 *
 * @memberof ReportingAPIClient @method getTotals
 * @param {Array} propertiesArray
 * @param {Object} propertiesArray[0] - properties: The configuration properties to use (timestamp, filters)
 * @return {Promise} getFromEndpoint
 */
ReportingAPIClient.prototype.getTotals = function(propertiesArray) {
  var properties = propertiesArray[0];
  var transformTotals = this.transformTotals.bind(this);
  return this.getFromEndpoint({
    caller: 'totals',
    query: {
      granularity: 'all',
      timestamp: properties.timestamp,
      filters: properties.filters
    }
  }, transformTotals);
};

/**
 * Constructs combined filters
 *
 * @memberof ReportingAPIClient @method constructCombinedFilters
 * @param {Object} initialFilters - The initial filters to process
 * @param {Array} newFilters - The new filters to set
 * @param {Array} targetDimensions - The dimensions to set
 * @return {Object}
 */
var constructCombinedFilters = function constructCombinedFilters(initialFilters, newFilters, targetDimensions) {
  // Construct filters based on previous result
  newFilters = newFilters || [];
  var filters = newFilters.reduce(function(obj, filter) {
    var dimensions = filter.dimensions;
    targetDimensions.forEach(function(key) {
      if (!obj[key]) {
        obj[key] = [];
      }
      obj[key].push(dimensions[key].value);
    });
    return obj;
  }, initialFilters);

  // Clear duplicates from filters
  var combinedFilters = Object.keys(filters).reduce(function(obj, key) {
    obj[key] = [].concat(_toConsumableArray(new Set(filters[key])));
    return obj;
  }, {});
  return combinedFilters;
};

/**
 * Transforms breakdown response
 *
 * @memberof ReportingAPIClient @method transformGroupped
 * @param {Array} groups - The list of groups to use
 * @return {Function}
 */
ReportingAPIClient.prototype.transformGroupped = function(groups) {
  var _self = this;
  return function(response) {
    return (response.data || []).map(function(record) {
      var dimensions = groups.reduce(function(obj, key) {
        // Set timestamp as a dimension (allows granularity groupping)
        var isGranularity = key === 'granularity';
        var value = isGranularity ? record.timestamp : record.dimensions[key];
        var label = isGranularity ? value : _self.generateLabelFor(key, value);
        obj[key] = {
          'label': label,
          'value': value
        };
        return obj;
      }, {});
      return {'dimensions': dimensions, 'metrics': record.result};
    });
  };
};

/**
 * Returns groupped data from Reporting API
 *
 * @memberof ReportingAPIClient @method getGroupped
 * @param {Object} properties The configuration properties to use (group, filters, granularity)
 * @param {String} caller The caller to assign for the XHR request
 * @return {Promise} getFromEndpoint
 */

ReportingAPIClient.prototype.getGroupped = function(properties, caller) {
  var _self = this;
  var group = properties.group;
  var sortId = group.sortId;
  var sortAscending = group.sortAscending;
  var pruneSizes = group.pruneSizes;
  var groups = group.groups;
  // Determine helper functions
  var transformFunc = this.transformGroupped(properties.group.groups);
  var sortFunc;
  if (sortAscending) {
    sortFunc = function sortFunc(a, b) {
      return a.metrics[sortId] - b.metrics[sortId];
    };
  } else {
    sortFunc = function sortFunc(a, b) {
      return b.metrics[sortId] - a.metrics[sortId];
    };
  }
  // Setup new request
  var sortableTree = new SortableTree();
  // Calculate partial splits
  var partialSplits = groups.map(function(group, index) {
    return groups.slice(0, index + 1);
  });
  // Return chained Promises for each partial split
  var lastPromiseResponse = null;
  return partialSplits.reduce(function(promise, group) {
    return promise.then(function() {
      var combinedFilters = constructCombinedFilters(properties.filters, lastPromiseResponse, group.slice(0, group.length - 1));
      // Prune groups to exclude granularity
      var prunedGroup = group.slice(0);
      var targetGranularity = 'all';
      var granularityIndex = group.indexOf('granularity');
      if (~ granularityIndex) {
        targetGranularity = properties.granularity;
        prunedGroup.splice(granularityIndex, 1);
      }
      console.log('combinedFilters', combinedFilters);
      // Send Promise for partial split
      return _self.getFromEndpoint({
        caller: caller,
        query: {
          granularity: targetGranularity,
          timestamp: properties.timestamp,
          filters: combinedFilters,
          group: prunedGroup
        }
      }, transformFunc).then(function(results) {
        // Add results to sortableTree tree
        results.forEach(function(item) {
          item.groupDimension = group.slice(-1)[0];
          var key = item.dimensions[group.slice(-1)].value;
          var pathKeys = group.slice(0, group.length - 1).map(function(key) {
            return item.dimensions[key].value;
          });
          sortableTree.addChild(item, key, pathKeys);
        });
        // Prune responses
        sortableTree.pruneBy(sortFunc, pruneSizes.slice(0));
        // Return flatten results to compute the next filters
        lastPromiseResponse = sortableTree.flatten();
        return lastPromiseResponse;
      });
    });
  }, Promise.resolve()).then(function() {
    // Map children values to iterable arrays
    return sortableTree.mapToArray();
  });
};

/**
 * Returns breakdown data from Reporting API
 *
 * @memberof ReportingAPIClient @method getBreakdown
 * @param {Array} propertiesArray
 * @param {Object} propertiesArray[0] - properties: The configuration properties to use (timestamp, filters)
 * @return {Promise}
 */
ReportingAPIClient.prototype.getBreakdown = function(propertiesArray) {
  var properties = propertiesArray[0];
  properties.group.pruneSizes = [50, 5, 5];
  return this.getGroupped(properties, 'breakdown');
};

/**
 * Returns timeseries from Reporting API
 *  - Granularity split should always be in the back of the splits queue
 *
 * @memberof ReportingAPIClient @method getTimeseries
 * @param {Array} propertiesArray
 * @param {Object} propertiesArray[0] - properties: The configuration properties to use (timestamp, filters)
 * @return {Promise}
 */
ReportingAPIClient.prototype.getTimeseries = function(propertiesArray) {
  var properties = propertiesArray[0];
  // Push granularity group to the end
  var orderedGroups = properties.group.groups.filter(function(id) {
    return id !== 'granularity';
  }).concat('granularity');
  properties.group.groups = orderedGroups;
  // Disable pruning for granularity level
  properties.group.pruneSizes = orderedGroups.map(function(id) {
    return id === 'granularity'? null: 50;
  });
  return this.getGroupped(properties, 'timeseries');
};

/**
 * Transforms dimension response
 *
 * @memberof ReportingAPIClient @method transformDimension
 * @param {String} dimensionName - The Dimension name to use
 * @return {Array}
 */
ReportingAPIClient.prototype.transformDimension = function(dimensionName) {
  var _self = this;
  return function(response) {
    var data = response.data[dimensionName];
    return data.map(function(value) {
      return {
        'id': value,
        'data': value,
        'label': _self.generateLabelFor(dimensionName, value)
      };
    });
  };
};

/**
 * Returns dimension values from Reporting API
 *
 * @memberof ReportingAPIClient @method getDimension
 * @param {Array} propertiesArray
 * @param {Object} propertiesArray[0] - properties: The configuration properties to use (timestamp, filters)
 * @param {String} propertiesArray[1] - dimensionName: The Dimension name to use
 * @param {String} propertiesArray[2] - query The query string to process
 * @return {Promise} getFromEndpoint
 */
ReportingAPIClient.prototype.getDimension = function(propertiesArray) {
  var properties = propertiesArray[0];
  var dimensionName = propertiesArray[1];
  var query = propertiesArray[2];
  // Prepare partial query
  properties.filters[dimensionName] = query;
  // Setup new request
  var transformDimension = this.transformDimension.bind(this);
  return this.getFromEndpoint({
    caller: 'dimensions',
    url: 'dimensions/' + dimensionName,
    query: {
      granularity: properties.granularity,
      timestamp: properties.timestamp,
      filters: properties.filters
    }
  }, transformDimension(dimensionName));
};

/**
 * Aborts previous XHR request for caller
 *
 * @memberof ReportingAPIClient @method abort
 * @param {String} caller - The target caller to tear down
 * @return {Void}
 */
ReportingAPIClient.prototype.abort = function(caller) {
  if (!this.requests.hasOwnProperty(caller)) {
    return;
  }
  this.requests[caller].abort();
  delete this.requests[caller];
};

/**
 * Aborts and removes all registered XHR requests
 *
 * @memberof ReportingAPIClient @method tearDown
 * @return {Void}
 */
ReportingAPIClient.prototype.tearDown = function() {
  var _self = this;
  Object.keys(this.requests).forEach(function(caller) {
    _self.abort(caller);
  });
};
exports.ReportingAPIClient = ReportingAPIClient;
