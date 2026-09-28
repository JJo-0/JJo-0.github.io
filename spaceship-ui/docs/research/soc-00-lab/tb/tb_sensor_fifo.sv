module tb_sensor_fifo;
  logic clk=0, rst_n=0, sample_valid=0;
  logic [15:0] sample_data=0;
  logic reg_wr_en=0, reg_rd_en=0;
  logic [4:0] reg_addr=0;
  logic [31:0] reg_wdata=0, reg_rdata;
  logic irq;
  sensor_fifo dut(.*);
  always #5 clk=~clk;

  task automatic wr(input logic [4:0] a,input logic [31:0] d);
    @(negedge clk); reg_addr=a; reg_wdata=d; reg_wr_en=1;
    @(negedge clk); reg_wr_en=0; reg_wdata=0;
  endtask
  task automatic rd(input logic [4:0] a,output logic [31:0] d);
    @(negedge clk); reg_addr=a; reg_rd_en=1; #1 d=reg_rdata;
    @(negedge clk); reg_rd_en=0;
  endtask
  task automatic push(input logic [15:0] d);
    @(negedge clk); sample_data=d; sample_valid=1;
    @(negedge clk); sample_valid=0;
  endtask
  task automatic reset_dut;
    rst_n=0; repeat(2) @(negedge clk); rst_n=1; @(negedge clk);
  endtask

  logic [31:0] r;
  integer i;
  initial begin
    reset_dut();
    rd(5'h04,r);
    assert(r[0] && !r[1] && r[12:8]==0) else $fatal("RESET");

    wr(5'h00,32'h1);
    push(16'h0011); push(16'h0022);
    rd(5'h08,r); assert(r[15:0]==16'h0011) else $fatal("FIFO_ORDER_1");
    rd(5'h08,r); assert(r[15:0]==16'h0022) else $fatal("FIFO_ORDER_2");

    reset_dut(); wr(5'h00,32'h1);
    for(i=0;i<16;i++) push(i[15:0]);
    rd(5'h04,r);
    assert(r[1] && r[12:8]==16) else $fatal("FULL");

    push(16'hbeef);
    rd(5'h10,r); assert(r[1]) else $fatal("OVERFLOW");

    wr(5'h10,32'h0);
    rd(5'h10,r); assert(r[1]) else $fatal("W1C_ZERO");
    wr(5'h10,32'h2);
    rd(5'h10,r); assert(!r[1]) else $fatal("W1C_ONE");

    reset_dut(); wr(5'h00,32'h1);
    push(16'h0011); push(16'h0022);
    rd(5'h08,r); assert(r[15:0]==16'h0011) else $fatal("READ_POP_DATA");
    rd(5'h04,r); assert(r[12:8]==1) else $fatal("READ_SIDE_EFFECT");

    $display("SOC00 LAB EXPECTED PASS CONDITIONS MET");
    $finish;
  end
endmodule
