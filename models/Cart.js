import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate cart total
cartSchema.methods.calculateTotal = async function () {
  await this.populate('items.product');

  let subtotal = 0;
  let discount = 0;

  this.items.forEach((item) => {
    const product = item.product;
    const itemTotal = product.price * item.quantity;
    const itemDiscount = (product.price * product.discount / 100) * item.quantity;

    subtotal += itemTotal;
    discount += itemDiscount;
  });

  return {
    subtotal,
    discount,
    total: subtotal - discount,
  };
};

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);
