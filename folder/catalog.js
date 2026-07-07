const INITIAL_VISIBLE_COUNT = 24;

function productsForGrid(grid) {
  if (grid.dataset.productGroup === "nonCore") {
    return PRODUCTS.filter((product) => product.category !== "Laptop" && product.category !== "Phone");
  }

  if (grid.dataset.productType) {
    return PRODUCTS.filter((product) => product.category === grid.dataset.productType);
  }

  if (grid.dataset.productCategory) {
    return PRODUCTS.filter((product) => product.category === grid.dataset.productCategory);
  }

  const subcategories = (grid.dataset.productSubcategories || "")
    .split(",")
    .map((subcategory) => subcategory.trim())
    .filter(Boolean);

  return PRODUCTS.filter((product) => subcategories.includes(product.subcategory));
}

function updateCountBadges() {
  document.querySelectorAll("[data-count]").forEach((element) => {
    const key = element.dataset.count;
    if (PRODUCT_COUNTS[key] !== undefined) {
      element.textContent = PRODUCT_COUNTS[key].toLocaleString("en-GH");
    }
  });
}

function renderGrid(grid, products, expanded = false) {
  const visibleProducts = expanded ? products : products.slice(0, INITIAL_VISIBLE_COUNT);
  grid.innerHTML = visibleProducts.map(productCard).join("");

  const existingButton = grid.parentElement.querySelector(".view-more-row");
  existingButton?.remove();

  if (products.length <= INITIAL_VISIBLE_COUNT) {
    return;
  }

  const row = document.createElement("div");
  row.className = "view-more-row";

  const button = document.createElement("button");
  button.className = "button outline";
  button.type = "button";
  button.textContent = expanded ? "Show fewer items" : `View all ${products.length.toLocaleString("en-GH")} listings`;
  button.addEventListener("click", () => renderGrid(grid, products, !expanded));

  row.append(button);
  grid.after(row);
}

updateCountBadges();

document.querySelectorAll(".product-grid").forEach((grid) => {
  renderGrid(grid, productsForGrid(grid));
});
