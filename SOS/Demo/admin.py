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
    list_display=(
        "OrderID",
        "CustName",
        "Phone",
        "Items",
        "Car_number",
        "Table_number",
        "Total",
        "status",
        "Staff",
        "payment_status",
        "payment_type",
    )

    search_fields=(
        "Car_number",
        "Table_number",
        "status",
        "payment_type",
        "payment_status",
        "Staff",
    )

    list_filter=(
        "Created_at"
    )

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):

    list_display=(
        "id",
        "ItemName",
        "ItemQuantity",
        "ItemPrice"
    )
    search_fields=(
        "ItemName",
        "itemPrice"
    )
    list_filter=(
        "created_at"
    )
