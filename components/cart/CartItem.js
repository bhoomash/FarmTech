'use client';

import { useCart } from '@/context/CartContext';

export default function CartItem({ item }) {
  const { updateCartItem, removeFromCart } = useCart();

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(item.product._id, newQuantity);
  };

  const handleRemove = async () => {
    if (confirm('Remove this item from cart?')) {
      await removeFromCart(item.product._id);
    }
  };

  if (!item.product) return null;

  const itemPrice = item.product.price * item.quantity;
  const itemDiscount = (item.product.price * item.product.discount / 100) * item.quantity;
  const itemTotal = itemPrice - itemDiscount;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-3">
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-tight">{item.product.name}</h3>
              <p className="text-neutral-500 text-xs">Size: M</p>
            </div>
            <button
              onClick={handleRemove}
              className="text-neutral-400 hover:text-red-500 transition"
              title="Remove item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Price */}
          <div className="mb-1">
            {item.product.discount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-neutral-900 font-semibold text-sm">
                  ₹{(item.product.price - (item.product.price * item.product.discount / 100)).toFixed(2)}
                </span>
                <span className="text-neutral-400 line-through text-sm">
                  ₹{item.product.price}
                </span>
              </div>
            ) : (
              <span className="text-neutral-900 font-semibold">₹{item.product.price}</span>
            )}
          </div>

          {/* Stock Info */}
          <div className="mb-2">
            <p className="text-neutral-500 text-xs">
              Size stock: <span className="font-medium">{item.product.stock}</span> | Total stock: <span className="font-medium">{item.product.stock}</span>
            </p>
          </div>

          {/* Quantity Adjuster */}
          <div className="mb-1">
            <p className="text-green-600 text-xs mb-1.5">
              Adjusting quantity for size M
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={item.quantity <= 1}
              >
                <span className="text-base font-medium">−</span>
              </button>
              <span className="font-semibold text-neutral-900 min-w-[1.5rem] text-center text-sm">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={item.quantity >= item.product.stock}
              >
                <span className="text-base font-medium">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
