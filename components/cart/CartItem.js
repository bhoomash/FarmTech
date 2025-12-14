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
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
      <img
        src={item.product.image}
        alt={item.product.name}
        className="w-24 h-24 object-cover rounded"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.product.name}</h3>
        <p className="text-gray-600 text-sm">{item.product.category}</p>
        
        <div className="mt-2">
          {item.product.discount > 0 ? (
            <div>
              <span className="text-primary-600 font-bold">
                ₹{(item.product.price - (item.product.price * item.product.discount / 100)).toFixed(2)}
              </span>
              <span className="text-gray-500 line-through text-sm ml-2">
                ₹{item.product.price}
              </span>
              <span className="text-red-500 text-sm ml-2">
                ({item.product.discount}% off)
              </span>
            </div>
          ) : (
            <span className="text-primary-600 font-bold">₹{item.product.price}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
          disabled={item.quantity <= 1}
        >
          -
        </button>
        <span className="font-semibold">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
          disabled={item.quantity >= item.product.stock}
        >
          +
        </button>
      </div>

      <div className="text-right">
        <div className="font-bold text-lg">₹{itemTotal.toFixed(2)}</div>
        <button
          onClick={handleRemove}
          className="text-red-500 text-sm hover:underline mt-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
