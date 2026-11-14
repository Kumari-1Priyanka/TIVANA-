import { useState, type FormEvent } from "react";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import type { OrderRecord } from "../types/fashion.ts";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

export function CartDrawer() {
  const {
    products,
    cart,
    isCartOpen,
    setIsCartOpen,
    cartSubtotal,
    budgetCap,
    setBudgetCap,
    updateCartQuantity,
    removeFromCart,
    user,
    placeOrder,
  } = useStore();

  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingName, setShippingName] = useState(user?.name ?? "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  if (!isCartOpen) return null;

  const productMap = new Map(products.map((p) => [p.id, p]));
  const budgetRatio = Math.min(100, Math.round((cartSubtotal / Math.max(1, budgetCap)) * 100));
  const overBudget = cartSubtotal > budgetCap;
  const freeDeliveryThreshold = 999;

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setSubmitting(true);
    try {
      const order = await placeOrder(shippingName, shippingAddress, paymentMethod);
      setConfirmedOrder(order);
      setShowCheckout(false);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div className="bg-[#FDFBFA] w-full max-w-md h-full flex flex-col border-l border-rose-900/15 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-900/10 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#B83B67]" />
            <h2 className="font-display text-xl font-semibold text-[#1D1518]">
              Shopping Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsCartOpen(false);
              setConfirmedOrder(null);
            }}
            aria-label="Close shopping bag"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#6C5D63] hover:text-[#1D1518] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Budget Tracker Bar */}
        <div className="px-6 py-3.5 bg-[#FAF3F5] border-b border-rose-900/10 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#1D1518]">Session Budget Tracker</span>
            <div className="flex items-center gap-1.5">
              <label htmlFor="bag-budget-cap" className="text-[#6C5D63]">
                Cap ₹
              </label>
              <input
                id="bag-budget-cap"
                type="number"
                min={500}
                step={250}
                value={budgetCap}
                onChange={(e) => setBudgetCap(Math.max(500, Number(e.target.value) || 500))}
                className="w-20 px-2 py-1 rounded-md border border-rose-900/15 bg-white text-xs font-semibold text-[#1D1518] tabular-nums"
              />
            </div>
          </div>

          <div className="h-2 rounded-full bg-white overflow-hidden border border-rose-900/10">
            <div
              className={`h-full transition-all duration-300 ${
                overBudget ? "bg-rose-700" : "bg-[#B83B67]"
              }`}
              style={{ width: `${budgetRatio}%` }}
            />
          </div>

          <p className="text-[11px] tabular-nums text-[#6C5D63]">
            {overBudget
              ? `Over budget by ₹${(cartSubtotal - budgetCap).toLocaleString("en-IN")} — adjust quantities or raise cap.`
              : `₹${(budgetCap - cartSubtotal).toLocaleString("en-IN")} remaining inside your ₹${budgetCap.toLocaleString("en-IN")} cap.`}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {confirmedOrder ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#B83B67] mx-auto" />
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#B83B67]">
                  {confirmedOrder.status}
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#1D1518] mt-1">
                  Order {confirmedOrder.id} Confirmed
                </h3>
                <p className="text-sm text-[#6C5D63] mt-1">
                  Delivering to {confirmedOrder.shippingName} · Paid via{" "}
                  {confirmedOrder.paymentMethod}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-rose-900/10 text-left space-y-2 text-xs">
                {confirmedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between tabular-nums">
                    <span className="text-[#1D1518]">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-rose-900/10 flex justify-between font-bold text-sm tabular-nums">
                  <span>Total Paid</span>
                  <span>₹{confirmedOrder.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  setIsCartOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#B83B67] text-white text-sm font-semibold cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="font-display text-xl font-semibold text-[#1D1518]">
                Your bag is empty
              </p>
              <p className="text-sm text-[#6C5D63]">
                Explore the shop or let AI Stylist assemble a complete outfit for you.
              </p>
            </div>
          ) : showCheckout ? (
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-[#1D1518]">
                  Delivery Details
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="text-xs font-semibold text-[#B83B67] cursor-pointer"
                >
                  Back to Bag
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="Ananya Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                  Shipping Address &amp; Postal Code
                </label>
                <textarea
                  rows={3}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="42 Rose Garden Road, Indiranagar, Bengaluru 560038"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm"
                >
                  <option>Cash on Delivery</option>
                  <option>UPI Instant Pay</option>
                  <option>Credit / Debit Card</option>
                </select>
              </div>

              {checkoutError && (
                <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg">
                  {checkoutError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] disabled:opacity-60 cursor-pointer"
              >
                {submitting
                  ? "Confirming Order..."
                  : `Confirm Order · ₹${cartSubtotal.toLocaleString("en-IN")}`}
              </button>
            </form>
          ) : (
            cart.map((item) => {
              const prod = productMap.get(item.productId);
              if (!prod) return null;
              return (
                <div
                  key={`${item.productId}-${item.selectedSize}`}
                  className="flex gap-3.5 bg-white border border-rose-900/10 rounded-xl p-3"
                >
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-[#FAF3F5] shrink-0">
                    <SafeFashionImage
                      imageKey={prod.imageKey}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-[#6C5D63]">{prod.brand}</p>
                        <p className="text-sm font-semibold text-[#1D1518] truncate">
                          {prod.name}
                        </p>
                        <p className="text-xs text-[#6C5D63]">
                          Size {item.selectedSize} · {item.selectedColor}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.selectedSize)}
                        aria-label="Remove item"
                        className="text-[#6C5D63] hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="inline-flex items-center border border-rose-900/15 rounded-lg">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.selectedSize, -1)
                          }
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#1D1518] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.selectedSize, 1)
                          }
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#1D1518] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-[#1D1518] tabular-nums">
                        ₹{(prod.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && !confirmedOrder && !showCheckout && (
          <div className="p-6 border-t border-rose-900/10 bg-white space-y-3">
            <div className="flex items-center justify-between text-xs text-[#6C5D63] tabular-nums">
              <span>Shipping</span>
              <span>
                {cartSubtotal >= freeDeliveryThreshold
                  ? "Complimentary Free Delivery"
                  : `Add ₹${freeDeliveryThreshold - cartSubtotal} for free delivery`}
              </span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold text-[#1D1518] tabular-nums">
              <span>Subtotal</span>
              <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!shippingName && user?.name) setShippingName(user.name);
                setShowCheckout(true);
              }}
              className="w-full py-3 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] transition-colors cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
