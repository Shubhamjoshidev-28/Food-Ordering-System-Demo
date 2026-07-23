from rest_framework import (
    serializers
)
from Demo.models.orders import (
    Order
)

class Order_Serializer(
    serializers.ModelSerializer
):
    class Meta:
        model=Order
        fields=[
            "CustName",
            "Phone",
            "Items",
            "Total",
            "Car_number",
            "Table_number",
            "Staff",
            "Payment_Status",
            "Payment_Type"
        ]