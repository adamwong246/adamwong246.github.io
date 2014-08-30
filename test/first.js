var assert = require("assert");
var should = require('should');

var eyes = require('eyes');

var wongoloid = require("../lib/wongoloid.js");

var universe;

describe('Wongoloid', function(){
  describe('#crunch(:underscore_file)', function(){

    before(function(){
      universe = wongoloid.crunch('../_src/_blog/_.js');
      eyes.inspect(universe);
    });

    describe("the path to the underscore file", function(){
      it("has 1st order key: 'src'", function(){
        universe.should.have.property('src');
      });

      it("has 2nd key: 'blog'", function(){
        universe.src.should.have.property('blog');
      });

      it("has 3rd key: '.js'", function(){
        universe.src.blog.should.have.property('.js');
      });

    });

    describe("the underscore file", function(){
      it('appends the require-ed underscore file', function(){
        universe.src.blog['.js'].should.equal(require('../_src/_blog/_.js'));
      });

      it('includes filer string', function(){
        universe.src.blog['.js'].filer.should.equal('**/*.md');
      });
    });


    describe('the input files', function(){
      it('appends files', function(){
        universe.src.blog.should.have.property('files');
      });

      it('appends the yaml frontmatter', function(){
        (typeof universe.src.blog.files[0]).should.equal('object');
      });
    });

  });
});