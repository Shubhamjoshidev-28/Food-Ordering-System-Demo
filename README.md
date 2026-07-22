# SMART ORDERING SYSTEM SYSTEM DEMO

Smart ordering system or SOS is a order management system that helps to create order , manage order , Delete orders and generate in invoice.

## Features
- Add order easily by kust selecting and add orders in the cart.
- View all order at one screen.
- Staff can be assigend to orders.
- Dashborads view of analytics.
- built in invoice generator.

## Folder Structure
```text
ORDERING SYSTEM DEMO
 ├── README.md
 ├── requirements.txt
 
 
 src/
 │   ├── index.html
 │   ├── css/
 │   │   └──style.css
 │   └── js/
 │       └── main.js
 │ 
 SOS/
 ├── Demo/
 │   ├── migrations/
 │   ├── models/
 │   ├── selectors/
 │   │   ├── menu_seletor.py
 │   │   └── order_selector.py
 │   ├── serializer/
 │   │   ├── menu_services.py
 │   │   └── order_services.py
 │   ├── services/
 │   │   ├── invoice_services.py
 │   │   ├── menu_services.py
 │   │   └── order_services.py
 │   ├── views/
 │   │   ├── menu_views.py
 │   │   └── order_views.py
 │   ├── __init__.py
 │   ├── admin.py
 │   ├── apps.py
 │   └── tests.py
 ├── SOS/
 │   ├── __init__.py
 │   ├── asgi.py
 │   ├── settings.py
 │   ├── urls.py
 │   └── wsgi.py
 ├── manage.py


