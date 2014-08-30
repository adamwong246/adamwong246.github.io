var assert = require("assert");

var wongoloid = require("../lib/wongoloid.js");

describe('Wongoloid', function(){
  describe('#foo()', function(){

    it("should return 'bar'", function(){
      assert.equal(wongoloid.foo(), 'bar');
    });
    
  });
});