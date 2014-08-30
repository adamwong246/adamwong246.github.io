var assert = require("assert");
var should = require('should');

var eyes = require('eyes');

var wongoloid = require("../lib/wongoloid.js");

var crunched_underscore_file;

describe('Wongoloid', function(){
  describe('#crunch(:underscore_file)', function(){

    before(function(){
      crunched_underscore_file = wongoloid.crunch('../_src/_blog/_.js');
      eyes.inspect(crunched_underscore_file);
    });

    describe("the path to the has", function(){
      it("has 1st order key: '_src'", function(){
        crunched_underscore_file.should.have.property('_src');
      });

      it("has 2nd key: '_blog'", function(){
        crunched_underscore_file._src.should.have.property('_blog');
      });

      it("has 3rd key: '_.js'", function(){
        crunched_underscore_file._src._blog.should.have.property('_.js');
      });
    });

    describe('there is an object on the path', function(){

    });

  });
});