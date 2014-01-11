require 'rubygems'
require 'date'
require 'titleize'

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