Rails.application.routes.draw do
  root to: 'diff_sets#index'
  resources :diff_sets
  resources :diffs
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
