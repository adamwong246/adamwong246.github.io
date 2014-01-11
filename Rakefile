require 'rubygems'
require 'date'
require 'titleize'
require 'tmpdir'

def x(command, description)
    
    puts description if description

    case system(command)
    when "Success"
        return
    when "Failed"
        raise "HALT"
    else
        raise "wtf?"
    end
end

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

# desc "Generate and publish blog to gh-pages"
# task :publish  do
#   Dir.mktmpdir do |tmp|
#     system "bundle exec middleman build"
#     system "shopt -s dotglob"
#     # system "mv build/* #{tmp}"
#     # system "git checkout master"
#     # system "rm -rf *"
#     # system "mv #{tmp}/* ."
#     # message = "Site updated at #{Time.now.utc}"
#     # system "git add ."
#     # system "git commit -am #{message.shellescape}"
#     # system "git push origin master --force"
#     # system "echo NOW MAKE SURE YOU SWITCH BACK TO YOUR WORKING BRANCH!"
#   end
# end

desc "Deploy build to master branch"
task :deploy do
  x("git branch -D master",                              "Deleting master branch")
  x("git checkout -b master",                            "Creating new master branch and switching to it")
  x("git filter-branch --subdirectory-filter build/ -f", "Forcing the build subdirectory to be project root")
  x("git checkout -",                                    "Switching back to previous branch")
  x("git push origin master",                            "Pushing branch to origin")
end