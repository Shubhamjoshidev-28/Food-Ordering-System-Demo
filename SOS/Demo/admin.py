from django.contrib import (
    admin
)
from Demo.models.orders import (
    Order
)
from Demo.models.menu import (
    Menu
)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    model=Order
    list_display=[
        "CustName",
        "Phone",
        "Items",
        "Car_number",
        "Table_number",
        "Total",
        "Status",
        "Staff",
        "Payment_Status",
        "Payment_Type",
    ]

    search_fields=[
        "Car_number",
        "Table_number",
        "Status",
        "Payment_Type",
        "Payment_Status",
        "Staff",
    ]

    list_filter=[
        "created_at"
    ]

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):

    list_display=[
        "id",
        "ItemName",
        "ItemQuantity",
        "ItemPrice"
    ]
    search_fields=[
        "ItemName",
        "itemPrice"
    ]
    list_filter=[
        "created_at"
    ]
