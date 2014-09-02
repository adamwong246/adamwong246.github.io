var assert = require("assert");
var should = require('should');
var fs = require('fs');
var eyes = require('eyes');

var wongoloid = require("../lib/wongoloid.js");

var universe;
var underscore;

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

      it('appends path to the yaml frontmatter', function(){
        universe.src.blog.files[0].path.should.equal("./_src/_blog/0/index.md");
      });
    });
  });

  describe('#render(:underscore)', function(){
    
    before(function(){
      underscore = wongoloid.crunch('../_src/_blog/_.js').src.blog;
      eyes.inspect(underscore);

      wongoloid.render(underscore);
    });

    it('creates files', function(){
      fs.existsSync('blogs/first-posts.html').should.be.true;
    });



  });
});