var common = require('../../../config/common')
var DB = require('../../../config/database')
var transModel = require("../../models/transModel");
var userModel = require("../../models/userModel");
var orderModel = require("../../models/orderModel");

async function getList (req, res, next) {
  try {
    const _trans = await transModel.getTransList();
    return common.send(res, 200, _trans, "Success");
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function detail (req, res, next) {
  const { receipt_id, subReceipt_id, is_sub_receipt } = req.body;

  try {
    let e_detail = {};
    if( is_sub_receipt === 0 )
      e_detail = await transModel.getTransDetail(receipt_id);
    else
      e_detail = await transModel.getSubTransDetail(subReceipt_id);

    let u_detail = {};
    if(e_detail.user_id)
      u_detail = await userModel.findUserById(e_detail.user_id);
    
    let o_detail = await orderModel.findOrdersByReceiptId(receipt_id);
    
    let detail = {
      e_detail,
      u_detail,
      o_detail
    }
    return common.send(res, 200, detail, "Success");

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

module.exports = {
  getList,
  detail
}