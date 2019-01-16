class Comment < ApplicationRecord
  belongs_to :diff, inverse_of: :comments
end
