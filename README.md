# Online-Billing-System

Create an account:

Method: POST
URL: http://localhost:3000/account
Body (raw, JSON):
```
{
  "username": "your_username"
}
```
Fetch all products:

Method: GET
URL: http://localhost:3000/products

Fetch all services:

Method: GET
URL: http://localhost:3000/services

Add an item to the cart:

Method: POST
URL: http://localhost:3000/cart/add
Body (raw, JSON):
```

{
  "type": "product",
  "id": "valid_product_id"
}
```
Replace valid_product_id with the ID of a product fetched from the previous API call.

Remove an item from the cart:

Method: DELETE
URL: http://localhost:3000/cart/remove
Body (raw, JSON):
```
{
  "type": "product",
  "id": "valid_product_id"
}
```
Replace valid_product_id with the ID of the product to remove from the cart.

Clear the cart:

Method: DELETE
URL: http://localhost:3000/cart/clear
View the total bill:

Method: GET
URL: http://localhost:3000/cart/total
Fetch all orders (admin only):

Method: GET
URL: http://localhost:3000/orders
