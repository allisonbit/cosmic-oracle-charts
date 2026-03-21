const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("OracleBullPaymentsModule", (m) => {
  const contract = m.contract("OracleBullPayments");
  return { contract };
});
