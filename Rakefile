require 'rubygems'
require 'date'
require 'titleize'
require 'tmpdir'
require 'pry'

def x(command, description, halt_on_fail=true)
    
    puts "-- #{description} --" if description
    status = system(command)
    puts status
    
    case status
    when "Success", true
        return
    when "Failed", false
        if halt_on_fail
          raise "HALT"
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
  path = "source/blog/#{date}-#{(subject).downcase.gsub(' ', '-')}.#{format}"
  
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
  x("git branch -D master",                              "Deleting master branch", false)
  x("git checkout -b master",                            "Creating new master branch and switching to it")
  x("git filter-branch --subdirectory-filter build/ -f", "Forcing the build subdirectory to be project root")
  x("git checkout -",                                    "Switching back to previous branch")
  x("git push -f origin master",                         "Pushing branch to origin")
end