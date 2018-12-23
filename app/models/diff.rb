class Diff < ApplicationRecord
  belongs_to :diff_set, inverse_of: :diffs, optional: true
end