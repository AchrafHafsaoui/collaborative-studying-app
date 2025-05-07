import User from "../models/user.js";
import Stripe from 'stripe'

const stripe = new Stripe('sk_test_51OZEdFGggnnmH2yDiBzjJPv8yYRxgsYbbraypiBxZVBHpPykplaqeVCzENO45GYP5MB2uGtTI2LfSZ9jBj4Cp5bp00ZtqNtTuH', {
  apiVersion: '2023-10-16',
});

export const getPaymentSheet = async (req, res, next) => {
    try {
      const {userId} = req.body;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ errors: 'User not found' });
    }
      
      const customer = await stripe.customers.create();
      const ephemeralKey = await stripe.ephemeralKeys.create(
        {customer: customer.id},
        {apiVersion: '2023-10-16'}
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 99,
        currency: 'eur',
        customer: customer.id,   
        automatic_payment_methods: {
        enabled: true,
      },  
      });
      console.log("CUSTOMER", customer);
      res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: 'pk_test_51OZEdFGggnnmH2yDfTCEqQ8p39xiWCqsdYEidH3vRUm5BJqg3xpDfeLmGb5YDR7d8d9Fe4IMkNi2QolkKL3JqZ4500K8L8R0uB'
      });
    } catch (ex) {
      return res.status(500).json({ errors: 'Internal server error' });
    }
};

