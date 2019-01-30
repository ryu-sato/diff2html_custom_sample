class DiffsController < ApplicationController
  before_action :set_diff, only: [:show, :edit, :update, :destroy, :comments]

  # GET /diffs
  # GET /diffs.json
  def index
    @diffs = Diff.all
  end

  # GET /diffs/1
  # GET /diffs/1.json
  def show
    render layout: 'diff'
  end

  # GET /diffs/new
  def new
    @diff = Diff.new
  end

  # GET /diffs/1/edit
  def edit
  end

  # POST /diffs
  # POST /diffs.json
  def create
    @diff = Diff.new(diff_params)

    respond_to do |format|
      if @diff.save
        format.html { redirect_to @diff, notice: 'Diff was successfully created.' }
        format.json { render :show, status: :created, location: @diff }
      else
        format.html { render :new }
        format.json { render json: @diff.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /diffs/1
  # PATCH/PUT /diffs/1.json
  def update
    respond_to do |format|
      if @diff.update(diff_params)
        format.html { redirect_to @diff, notice: 'Diff was successfully updated.' }
        format.json { render :show, status: :ok, location: @diff }
      else
        format.html { render :edit }
        format.json { render json: @diff.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /diffs/1
  # DELETE /diffs/1.json
  def destroy
    @diff.destroy
    respond_to do |format|
      format.html { redirect_to diffs_url, notice: 'Diff was successfully destroyed.' }
      format.json { head :no_content }
    end
  end
  
  # GET /diffs/1/comments.json
  def comments
    @comments = @diff.comments
    @comments = @comments.where(line: params[:line]) if params[:line].present?
    @comments = @comments.where(for_from: params[:for_from]) if params[:for_from].present?

    respond_to do |format|
      format.json { render "comments/index" }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_diff
      @diff = Diff.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def diff_params
      params.require(:diff).permit(:content)
    end
end
