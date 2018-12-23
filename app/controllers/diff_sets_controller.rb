class DiffSetsController < ApplicationController
  before_action :set_diff_set, only: [:show, :edit, :update, :destroy]

  # GET /diff_sets
  # GET /diff_sets.json
  def index
    @diff_sets = DiffSet.all
  end

  # GET /diff_sets/1
  # GET /diff_sets/1.json
  def show
  end

  # GET /diff_sets/new
  def new
    @diff_set = DiffSet.new
  end

  # GET /diff_sets/1/edit
  def edit
  end

  # POST /diff_sets
  # POST /diff_sets.json
  def create
    @diff_set = DiffSet.new(diff_set_params)

    respond_to do |format|
      if @diff_set.save
        format.html { redirect_to @diff_set, notice: 'Diff set was successfully created.' }
        format.json { render :show, status: :created, location: @diff_set }
      else
        format.html { render :new }
        format.json { render json: @diff_set.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /diff_sets/1
  # PATCH/PUT /diff_sets/1.json
  def update
    respond_to do |format|
      if @diff_set.update(diff_set_params)
        format.html { redirect_to @diff_set, notice: 'Diff set was successfully updated.' }
        format.json { render :show, status: :ok, location: @diff_set }
      else
        format.html { render :edit }
        format.json { render json: @diff_set.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /diff_sets/1
  # DELETE /diff_sets/1.json
  def destroy
    @diff_set.destroy
    respond_to do |format|
      format.html { redirect_to diff_sets_url, notice: 'Diff set was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_diff_set
      @diff_set = DiffSet.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def diff_set_params
      params.fetch(:diff_set, {})
    end
end
