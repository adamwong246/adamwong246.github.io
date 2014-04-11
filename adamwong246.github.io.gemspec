# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "adamwong246.github.io"
  s.version = "0.1.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Wong, Adam"]
  s.date = "2014-02-09"
  s.email = "adamwong246@gmail.com"
  s.extra_rdoc_files = ["README.md"]
  s.files = ["config.rb", "Copying", "Gemfile", "Gemfile.lock", "Rakefile", "README.md", "spec/feature/alpha_spec.rb", "spec/features/alpha_spec.rb", "spec/spec_helper.rb"]
  s.homepage = "http://yoursite.example.com"
  s.rdoc_options = ["--main", "README.md"]
  s.require_paths = ["lib"]
  s.rubygems_version = "2.0.3"
  s.summary = "What this thing does"

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<rspec>, [">= 0"])
    else
      s.add_dependency(%q<rspec>, [">= 0"])
    end
  else
    s.add_dependency(%q<rspec>, [">= 0"])
  end
end
