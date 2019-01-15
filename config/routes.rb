Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root to: 'diff_sets#index'
  resources :diff_sets
  resources :diffs
  resources :comments, only: [:index, :create, :update, :destroy]
end
