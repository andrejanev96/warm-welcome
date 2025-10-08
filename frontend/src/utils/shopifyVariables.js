export const SHOPIFY_VARIABLE_GROUPS = [
  {
    title: "Customer Profile",
    icon: "🧑",
    variables: [
      { token: "customer.firstName", description: "Customer's first name" },
      { token: "customer.lastName", description: "Customer's last name" },
      { token: "customer.email", description: "Primary email address" },
      { token: "customer.phone", description: "Phone number (if provided)" },
      { token: "customer.totalSpent", description: "Lifetime spend formatted as currency" },
    ],
  },
  {
    title: "Recent Order",
    icon: "🛍️",
    variables: [
      { token: "order.name", description: "Order number (e.g. #1001)" },
      { token: "order.totalPrice", description: "Order total formatted with currency" },
      { token: "order.createdAt", description: "Order date (localized)" },
      {
        token: "order.fulfillmentStatus",
        description: "Fulfillment status (e.g. pending, shipped)",
      },
      { token: "order.itemCount", description: "Number of line items" },
    ],
  },
  {
    title: "Products",
    icon: "📦",
    variables: [
      { token: "order.firstProduct.title", description: "Title of the first product in the order" },
      { token: "order.firstProduct.handle", description: "Handle/slug for the first product" },
      { token: "order.firstProduct.url", description: "Online store URL for the first product" },
      { token: "order.productList", description: "Comma separated list of product titles" },
    ],
  },
  {
    title: "Store & Links",
    icon: "🔗",
    variables: [
      { token: "store.name", description: "Your Shopify store name" },
      { token: "store.supportEmail", description: "Support email configured for your store" },
      { token: "store.domain", description: "Primary storefront domain" },
      { token: "store.accountUrl", description: "Customer account portal link" },
    ],
  },
];

export const EXAMPLE_CUSTOMER_TOKEN = "{customer.firstName}";
