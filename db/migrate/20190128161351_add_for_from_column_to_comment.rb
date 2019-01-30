class AddForFromColumnToComment < ActiveRecord::Migration[5.2]
  def change
    add_column :comments, :for_from, :boolean, default: false
  end
end
