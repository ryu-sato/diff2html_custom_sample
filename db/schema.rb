# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_01_28_161351) do

  create_table "comments", force: :cascade do |t|
    t.integer "diff_id"
    t.bigint "line"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "for_from", default: false
    t.index ["diff_id"], name: "index_comments_on_diff_id"
  end

  create_table "diff_sets", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "diffs", force: :cascade do |t|
    t.text "content", limit: 65536
    t.integer "diff_set_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["diff_set_id"], name: "index_diffs_on_diff_set_id"
  end

end
