require 'rubygems'
require 'date'
require 'titleize'
require 'tmpdir'

desc "Generate a blog file"
task :new_log, :subject do|t, args|
    puts args
    if args[:subject]
      date = DateTime.now.strftime('%Y-%m-%d')
        File.open("source/blog/#{date}-#{args[:subject]}.slim", 'w') {|f| 
            f.write("---\ndate: #{date}\nlayout: post\ntitle:  '#{args[:subject].titleize.gsub('-', ' ')}'\n---") 
        }
    else
        raise "You need to pass an argument like this: bundle exec 'rake new_log[Derp]'"
    end
end

desc "Generate and publish blog to gh-pages"
task :publish  do
  Dir.mktmpdir do |tmp|
    system "bundle exec middleman build"
    system "shopt -s dotglob"
    # system "mv build/* #{tmp}"
    # system "git checkout master"
    # system "rm -rf *"
    # system "mv #{tmp}/* ."
    # message = "Site updated at #{Time.now.utc}"
    # system "git add ."
    # system "git commit -am #{message.shellescape}"
    # system "git push origin master --force"
    # system "echo NOW MAKE SURE YOU SWITCH BACK TO YOUR WORKING BRANCH!"
  end
end

desc "Deploy build to master branch"
task :deploy do
  puts "\n## Deleting master branch"
  status = system("git branch -D master")
  puts status ? "Success" : "Failed"
  puts "\n## Creating new master branch and switching to it"
  status = system("git checkout -b master")
  puts status ? "Success" : "Failed"
  puts "\n## Forcing the build subdirectory to be project root"
  status = system("git filter-branch --subdirectory-filter build/ -f")
  puts status ? "Success" : "Failed"
  # puts "\n## Switching back to source branch"
  # status = system("git checkout source")
  # puts status ? "Success" : "Failed"
  puts "\n## Pushing branch to origin"
  status = system("git push origin master")
  puts status ? "Success" : "Failed"
  system "echo NOW MAKE SURE YOU SWITCH BACK TO YOUR WORKING BRANCH!"
end