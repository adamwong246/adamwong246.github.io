describe "getting our feet wet with rspec WITHOUT rails." do
  it "should run a sanity test" do
    !(true).should == false
  end
  it "should be able to access the page" do
    page.navigate_to "/"
    page.should have_content "Codesmithery par excellence"
  end
end