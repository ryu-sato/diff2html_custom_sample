class DiffSet < ApplicationRecord
  has_many :diffs, inverse_of: :diff_set
end
