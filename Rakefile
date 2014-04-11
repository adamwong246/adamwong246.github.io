require 'rubygems'
require 'date'
require 'titleize'
require 'tmpdir'
require 'pry'

def x(command, description, halt_on_fail=true)
    
    puts "-- #{description} --" if description
    status = system(command)
    
    case status
    when "Success", true
        return
    when "Failed", false
        if halt_on_fail
          system("git checkout -")
          raise "HALTING ON FAILURE. set halt_on_fail to true to ignore failure for this step"
        end
    else
        raise "wtf?"
    end
end


desc "Generate a blog file"
task :new_log do|t|
  puts "Subject?"
  subject  = (STDIN.gets).strip
  puts "Format?"
  format = (STDIN.gets).strip
  puts "Tags?"
  tags = (STDIN.gets).strip
  
  date = DateTime.now.strftime('%Y-%m-%d')
  path = "source/blog/#{date}-#{(subject).downcase.gsub(' ', '-').gsub('\'', '').gsub('.', '_')}.#{format}"
  
  f = File.open(path, 'w') {|f| 
      f.write(<<HERE
---
date: #{date}
title: #{subject}
tags: #{tags}
---
HERE
      ) 
  }
  puts path

end

desc "Deploy build to master branch"
task :deploy do
  x("bundle exec middleman build",                       "Build the site", false)

  x("cp COPYING build/COPYING", "add COPYING file")
  x("cp README.md build/README.md", "add README file")

  x("git add -A",                                        "add everything")
  x("git commit -m \"rake deploy auto commit\"",         "Commit everything")
  x("git branch -D master",                              "Deleting master branch", false)
  x("git checkout -b master",                            "Creating new master branch and switching to it")
  x("git filter-branch --subdirectory-filter build/ -f", "Forcing the build subdirectory to be project root")
  x("git checkout -",                                    "Switching back to previous branch")
  x("git push -f origin master",                         "Pushing branch to origin")
end

require "rubygems"
require "rubygems/package_task"
require "rdoc/task"

require "rspec"
require "rspec/core/rake_task"
RSpec::Core::RakeTask.new do |t|
  t.rspec_opts = %w(--format documentation --colour)
end


task :default => ["spec"]

# This builds the actual gem. For details of what all these options
# mean, and other ones you can add, check the documentation here:
#
#   http://rubygems.org/read/chapter/20
#
spec = Gem::Specification.new do |s|

  # Change these as appropriate
  s.name              = "adamwong246.github.io"
  s.version           = "0.1.0"
  s.summary           = "What this thing does"
  s.author            = "Wong, Adam"
  s.email             = "adamwong246@gmail.com"
  s.homepage          = "http://yoursite.example.com"

  s.has_rdoc          = true
  s.extra_rdoc_files  = %w(README.md)
  s.rdoc_options      = %w(--main README.md)

  # Add any extra files to include in the gem
  s.files             = %w(config.rb Copying Gemfile Gemfile.lock Rakefile README.md) + Dir.glob("{spec,lib}/**/*")
  s.require_paths     = ["lib"]

  # If you want to depend on other gems, add them here, along with any
  # relevant versions
  # s.add_dependency("some_other_gem", "~> 0.1.0")

  # If your tests use any gems, include them here
  s.add_development_dependency("rspec")
end

# This task actually builds the gem. We also regenerate a static
# .gemspec file, which is useful if something (i.e. GitHub) will
# be automatically building a gem for this project. If you're not
# using GitHub, edit as appropriate.
#
# To publish your gem online, install the 'gemcutter' gem; Read more 
# about that here: http://gemcutter.org/pages/gem_docs
Gem::PackageTask.new(spec) do |pkg|
  pkg.gem_spec = spec
end

desc "Build the gemspec file #{spec.name}.gemspec"
task :gemspec do
  file = File.dirname(__FILE__) + "/#{spec.name}.gemspec"
  File.open(file, "w") {|f| f << spec.to_ruby }
end

# If you don't want to generate the .gemspec file, just remove this line. Reasons
# why you might want to generate a gemspec:
#  - using bundler with a git source
#  - building the gem without rake (i.e. gem build blah.gemspec)
#  - maybe others?
task :package => :gemspec

# Generate documentation
RDoc::Task.new do |rd|
  rd.main = "README.md"
  rd.rdoc_files.include("README.md", "lib/**/*.rb")
  rd.rdoc_dir = "rdoc"
end

desc 'Clear out RDoc and generated packages'
task :clean => [:clobber_rdoc, :clobber_package] do
  rm "#{spec.name}.gemspec"
end
