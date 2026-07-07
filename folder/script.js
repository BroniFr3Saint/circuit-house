const formatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

const params = new URLSearchParams(window.location.search);
const item = params.get("item") || "No item selected";
const price = Number(params.get("price") || 0);

const itemEl = document.querySelector("#summary-item");
const priceEl = document.querySelector("#summary-price");
const deliveryEl = document.querySelector("#summary-delivery");
const totalEl = document.querySelector("#summary-total");
const deliveryInputs = document.querySelectorAll('input[name="delivery"]');
const placeOrderButton = document.querySelector("#place-order");
const orderStatus = document.querySelector("#order-status");

function money(value) {
  return formatter.format(value).replace("GHS", "GH₵");
}

function updateSummary() {
  const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
  const delivery = Number(selectedDelivery?.value || 0);

  itemEl.textContent = item;
  priceEl.textContent = money(price);
  deliveryEl.textContent = money(delivery);
  totalEl.textContent = money(price + delivery);
}

deliveryInputs.forEach((input) => input.addEventListener("change", updateSummary));
updateSummary();

placeOrderButton?.addEventListener("click", () => {
  const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
  const delivery = Number(selectedDelivery?.value || 0);
  orderStatus.textContent = `${item} has been added to your order. Total: ${money(price + delivery)}. CircuitHouse will confirm availability and delivery.`;
});
