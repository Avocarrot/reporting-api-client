/*jshint node:true */
/*jshint expr:true */
var expect = require('chai').expect;
var SortableTree = require('../index').SortableTree;
var describe = require('mocha').describe;
var it = require('mocha').it;
var Map = require('core-js/library/fn/map');

describe('Unit: Utils - SortableTree', function(){

  it('is an object', function() {
    var sortableTree = new SortableTree();
    expect(sortableTree).to.be.instanceof(Object);
    expect(sortableTree).to.have.property('data').that.is.null;
    expect(sortableTree).to.have.property('children').that.is.instanceof(Map);
  });

  /**
   * Constructor
   */
  it('constructor() can be initialized with data', function() {
    const data = {
      foo: 'bar'
    };
    var sortableTree = new SortableTree(data);
    expect(sortableTree.data).to.eql(data);
  });

  /**
   * addChild(data, key, pathKeys)
   */
  it('addChild(data, key, pathKeys) adds child to children Map', function() {
    // Setup ordered stack
    var sortableTree = new SortableTree({'value': 0});
    var child1 = sortableTree.addChild({
      'value': 1
    }, 'foo');
    var child2 = sortableTree.addChild({
      'value': 2
    }, 'bar');
    var child3 = sortableTree.addChild({
      'value': 3
    }, 'baz', ['foo']);
    var child4 = sortableTree.addChild({
      'value': 3
    }, null, ['bar']);
    // Assert children states
    const children = sortableTree.children;
    expect(children.size).to.equal(2);
    expect(children.get('foo')).to.eql(child1);
    expect(children.get('foo').children.size).to.equal(1);
    expect(children.get('foo').children.get('baz')).to.eql(child3);
    expect(children.get('bar')).to.eql(child2);
    expect(children.get('bar').children.size).to.equal(1);
    expect(children.get('bar').children.get('null')).to.eql(child4);
  });

  /**
   * pruneBy(sortFunc, sizes)
   */
  it('pruneBy(sortFunc, sizes) returns pruned children sorted by sortId', function() {
    // Setup ordered stack
    var sortableTree = new SortableTree();
    // Setup children
    sortableTree.addChild({
      'value': 1
    }, 'foo');
    sortableTree.addChild({
      'value': 1
    }, 'foo-1', ['foo']);
    sortableTree.addChild({
      'value': 10
    }, 'foo-2', ['foo']);
    var child2 = sortableTree.addChild({
      'value': 10
    }, 'bar');
    var grandchild21 = sortableTree.addChild({
      'value': 10
    }, 'bar-1', ['bar']);
    sortableTree.addChild({
      'value': 1
    }, 'bar-2', ['bar']);
    var child3 = sortableTree.addChild({
      'value': 100
    }, 'baz');
    sortableTree.addChild({
      'value': 1
    }, 'baz-1', ['baz']);
    var grandchild32 = sortableTree.addChild({
      'value': 10
    }, 'baz-2', ['baz']);
    // Prune items (2 items - 1st level, 1 item - 2nd level)
    sortableTree.pruneBy((a, b) => {
      return b.value - a.value;
    }, [2, 1]);
    // Assert sorted children
    const results = [...sortableTree.children];
    expect(results).to.have.length(2);
    // Child 1 results
    const resultsChild1 = results[0][1];
    const resultsChild1Children = [...resultsChild1.children];
    expect(resultsChild1).to.eql(child3);
    expect(resultsChild1Children).to.have.length(1);
    expect(resultsChild1Children[0][1]).to.eql(grandchild32);
    // Child 2 results
    const resultsChild2 = results[1][1];
    const resultsChild2Children = [...resultsChild2.children];
    expect(resultsChild2).to.eql(child2);
    expect(resultsChild2Children).to.have.length(1);
    expect(resultsChild2Children[0][1]).to.eql(grandchild21);
  });

  it('pruneBy(sortFunc, sizes) should skip pruning if there is no prune size defined', function() {
    // Setup ordered stack
    var sortableTree = new SortableTree();
    // Setup children
    sortableTree.addChild({
      'value': 2
    }, 'foo');
    sortableTree.addChild({
      'value': 3
    }, 'bar');
    sortableTree.addChild({
      'value': 1
    }, 'baz');
    // Prune items (null - 1st level)
    sortableTree.pruneBy((a, b) => {
      return b.value - a.value;
    }, [null]);
    const results = [...sortableTree.children];
    // Assert that no pruning occured
    expect(results).to.have.length(3);
    // Assert correct order for sorted children
    expect(results[0][0]).to.equal('bar');
    expect(results[1][0]).to.equal('foo');
    expect(results[2][0]).to.equal('baz');
  });

  /**
   * flatten()
   */
  it('flatten() flattens nodes in an Array', function() {
    // Setup ordered stack
    const rootData = {
      'id': 'root'
    };
    const child1Data = {
      'id': 'child-1'
    };
    const child2Data = {
      'id': 'child-2'
    };
    const grandchild1Data = {
      'id': 'child-1-1'
    };
    const grandchild2Data = {
      'id': 'child-2-1'
    };
    var sortableTree = new SortableTree(rootData);
    // Setup children
    sortableTree.addChild(child1Data, 'foo');
    sortableTree.addChild(child2Data, 'foo-1', ['foo']);
    sortableTree.addChild(grandchild1Data, 'bar');
    sortableTree.addChild(grandchild2Data, 'bar-1', ['bar']);
    // Flatten stack
    var flattenStack = sortableTree.flatten();
    // Assert results
    expect(flattenStack).to.have.length(5);
    expect(flattenStack).to.eql([rootData, child1Data, child2Data, grandchild1Data, grandchild2Data]);
  });

  /**
   * mapToArray()
   */
  it('mapToArray() converts children nodes from Map to Array', function() {
    // Setup ordered stack
    var sortableTree = new SortableTree({'value': 0});
    sortableTree.addChild({
      'value': 1
    }, 'foo');
    sortableTree.addChild({
      'value': 2
    }, 'bar');
    sortableTree.addChild({
      'value': 3
    }, 'baz', ['foo']);
    // Apply mapToArray
    var result = sortableTree.mapToArray();
    var child1 = result.children[0];
    var child2 = result.children[1];
    expect(result.children).to.be.a('array').with.length(2);
    expect(child1.data).to.eql({value: 1});
    expect(child1.children).to.be.a('array').with.length(1);
    expect(child1.children[0].data).to.eql({value: 3});
    expect(child2.data).to.eql({value: 2});
    expect(child2.children).to.be.a('array').with.length(0);
  });
});
