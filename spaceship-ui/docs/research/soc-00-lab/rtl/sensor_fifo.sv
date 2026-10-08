module sensor_fifo #(
  parameter int WIDTH = 16,
  parameter int DEPTH = 16
) (
  input  logic clk, rst_n,
  input  logic sample_valid,
  input  logic [WIDTH-1:0] sample_data,
  input  logic reg_wr_en, reg_rd_en,
  input  logic [4:0] reg_addr,
  input  logic [31:0] reg_wdata,
  output logic [31:0] reg_rdata,
  output logic irq
);
  localparam logic [4:0] A_CTRL=5'h00, A_STATUS=5'h04, A_DATA=5'h08,
                         A_IRQ_ENABLE=5'h0c, A_IRQ_STATE=5'h10;
  localparam int PTR_W=$clog2(DEPTH), CNT_W=$clog2(DEPTH+1);

  logic [WIDTH-1:0] mem [0:DEPTH-1];
  logic [PTR_W-1:0] wr_ptr, rd_ptr;
  logic [CNT_W-1:0] count;
  logic enable;
  logic [1:0] irq_enable, irq_state;
  logic pop, push_req, push_ok, overflow_event;

  assign pop = reg_rd_en && reg_addr==A_DATA && count!=0;
  assign push_req = sample_valid && enable;
  assign push_ok = push_req && (count<DEPTH || pop);
  assign overflow_event = push_req && !push_ok;
  assign irq = |(irq_enable & irq_state);

  always_comb begin
    reg_rdata=32'h0;
    unique case (reg_addr)
      A_CTRL:       reg_rdata={31'h0,enable};
      A_STATUS:     reg_rdata={19'h0,count[4:0],6'h0,(count==DEPTH),(count==0)};
      A_DATA:       reg_rdata=(count!=0) ? {{(32-WIDTH){1'b0}},mem[rd_ptr]} : 32'h0;
      A_IRQ_ENABLE: reg_rdata={30'h0,irq_enable};
      A_IRQ_STATE:  reg_rdata={30'h0,irq_state};
      default:      reg_rdata=32'h0;
    endcase
  end

  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      wr_ptr<='0; rd_ptr<='0; count<='0;
      enable<=1'b0; irq_enable<=2'b00; irq_state<=2'b00;
    end else begin
      if (reg_wr_en && reg_addr==A_CTRL) enable<=reg_wdata[0];
      if (reg_wr_en && reg_addr==A_IRQ_ENABLE) irq_enable<=reg_wdata[1:0];

      if (push_ok) begin mem[wr_ptr]<=sample_data; wr_ptr<=wr_ptr+1'b1; end
      if (pop) rd_ptr<=rd_ptr+1'b1;

      unique case ({push_ok,pop})
        2'b10: count<=count+1'b1;
        2'b01: count<=count-1'b1;
        default: count<=count;
      endcase

      /* W1C first, then HW events: a new event wins a collision. */
      if (reg_wr_en && reg_addr==A_IRQ_STATE)
        irq_state<=irq_state & ~reg_wdata[1:0];
      if (push_ok) irq_state[0]<=1'b1;
      if (overflow_event) irq_state[1]<=1'b1;
    end
  end
endmodule
