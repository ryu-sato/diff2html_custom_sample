require 'test_helper'

class DiffSetsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @diff_set = diff_sets(:one)
  end

  test "should get index" do
    get diff_sets_url
    assert_response :success
  end

  test "should get new" do
    get new_diff_set_url
    assert_response :success
  end

  test "should create diff_set" do
    assert_difference('DiffSet.count') do
      post diff_sets_url, params: { diff_set: {  } }
    end

    assert_redirected_to diff_set_url(DiffSet.last)
  end

  test "should show diff_set" do
    get diff_set_url(@diff_set)
    assert_response :success
  end

  test "should get edit" do
    get edit_diff_set_url(@diff_set)
    assert_response :success
  end

  test "should update diff_set" do
    patch diff_set_url(@diff_set), params: { diff_set: {  } }
    assert_redirected_to diff_set_url(@diff_set)
  end

  test "should destroy diff_set" do
    assert_difference('DiffSet.count', -1) do
      delete diff_set_url(@diff_set)
    end

    assert_redirected_to diff_sets_url
  end
end
