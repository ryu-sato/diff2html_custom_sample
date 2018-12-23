require "application_system_test_case"

class DiffSetsTest < ApplicationSystemTestCase
  setup do
    @diff_set = diff_sets(:one)
  end

  test "visiting the index" do
    visit diff_sets_url
    assert_selector "h1", text: "Diff Sets"
  end

  test "creating a Diff set" do
    visit diff_sets_url
    click_on "New Diff Set"

    click_on "Create Diff set"

    assert_text "Diff set was successfully created"
    click_on "Back"
  end

  test "updating a Diff set" do
    visit diff_sets_url
    click_on "Edit", match: :first

    click_on "Update Diff set"

    assert_text "Diff set was successfully updated"
    click_on "Back"
  end

  test "destroying a Diff set" do
    visit diff_sets_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Diff set was successfully destroyed"
  end
end
