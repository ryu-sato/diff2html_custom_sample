class CreateDiffSets < ActiveRecord::Migration[5.2]
  def change
    create_table :diff_sets do |t|
      t.timestamps
    end
  end
end
