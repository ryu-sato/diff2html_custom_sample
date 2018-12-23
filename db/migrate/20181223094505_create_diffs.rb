class CreateDiffs < ActiveRecord::Migration[5.2]
  def change
    create_table :diffs do |t|
      t.text :content, limit: 65536

      t.timestamps
    end
  end
end
