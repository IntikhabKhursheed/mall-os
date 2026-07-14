const test = require("node:test");
const assert = require("node:assert/strict");
const { validateSalePayload } = require("../src/controllers/posController");

test("accepts Pakistani payment methods for sale validation", () => {
  const accepted = validateSalePayload({
    items: [{ productId: "prod-1", quantity: 1 }],
    paymentMethod: "easypaisa"
  });

  assert.deepEqual(accepted, {});
});

test("accepts Raast and card payments", () => {
  assert.deepEqual(validateSalePayload({ items: [{ productId: "prod-1", quantity: 1 }], paymentMethod: "raast" }), {});
  assert.deepEqual(validateSalePayload({ items: [{ productId: "prod-1", quantity: 1 }], paymentMethod: "card" }), {});
});

test("rejects unsupported payment methods", () => {
  const errors = validateSalePayload({ items: [{ productId: "prod-1", quantity: 1 }], paymentMethod: "paypal" });
  assert.equal(errors.paymentMethod, "paymentMethod must be cash, card, Easypaisa/JazzCash, Raast, or wallet");
});
