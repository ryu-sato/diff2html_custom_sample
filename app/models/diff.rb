class Diff < ApplicationRecord
  belongs_to :diff_set, inverse_of: :diffs, optional: true
  has_many :comments, dependent: :destroy, inverse_of: :diff
end