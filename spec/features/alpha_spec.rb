require "spec_helper"

describe "Wikipedia's Ramen Page", :sauce => true do
  it "Should mention the inventor of instant Ramen" do
    visit "http://en.wikipedia.org/"
    fill_in 'search', :with => "Ramen"
    click_button "searchButton"
    page.should have_content "Momofuku Ando"
  end
end

describe "getting our feet wet with rspec WITHOUT rails." do
  it "should run a sanity test" do
    !(true).should == false
  end
  it "should be able to access the page" do
    page.navigate_to "/"
    page.should have_content "Codesmithery par excellence"
  end
end