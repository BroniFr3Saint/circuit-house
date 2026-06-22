const form = document.querySelector(".budget-form");
const input = document.querySelector("#budget-input");
const categoryInput = document.querySelector("#budget-category");
const statusEl = document.querySelector("#budget-status");
const resultsEl = document.querySelector("#budget-results");

function renderBudgetResults(amount) {
  const category = categoryInput.value;
  const matches = PRODUCTS.filter((product) => product.price <= amount)
    .filter((product) => category === "All" || product.category === category)
    .sort((a, b) => b.price - a.price)
    .slice(0, 120);

  const categoryLabel = category === "All" ? "products and services" : `${category.toLowerCase()} listings`;

  statusEl.textContent = matches.length
    ? `Showing ${matches.length} ${categoryLabel} at or below ${formatCedis(amount)}, closest prices first.`
    : `No ${categoryLabel} found at or below ${formatCedis(amount)}. Try a higher budget or choose all categories.`;

  resultsEl.innerHTML = matches.map(productCard).join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = Number(input.value);

  if (!amount || amount < 0) {
    statusEl.textContent = "Enter a valid amount in cedis.";
    resultsEl.innerHTML = "";
    return;
  }

  renderBudgetResults(amount);
});

const initialBudget = new URLSearchParams(window.location.search).get("budget");
if (initialBudget) {
  input.value = initialBudget;
  renderBudgetResults(Number(initialBudget));
}
