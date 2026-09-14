export const STATUSES = [
  "Placed",
  "Sent to Supplier",
  "In Transit",
  "Customs Clearance",
  "Out for Delivery",
  "Delivered",
];

export const INSTANT_STATUSES = ["Placed", "Out for Delivery", "Delivered"];

export const STATUS_COLOR = {
  Placed: "#6B7280",
  "Sent to Supplier": "#B45309",
  "In Transit": "#D9A441",
  "Customs Clearance": "#C8383A",
  "Out for Delivery": "#2F6F9E",
  Delivered: "#2F8F6B",
};

export const STATUS_DESCRIPTION = {
  Placed: "We've received your order and it's being prepared.",
  "Sent to Supplier": "Your order has been sent to our overseas supplier.",
  "In Transit": "Your order is on its way via courier.",
  "Customs Clearance": "Your order has arrived and is clearing customs.",
  "Out for Delivery": "Your order is out for delivery.",
  Delivered: "Your order has been delivered. Enjoy!",
};
