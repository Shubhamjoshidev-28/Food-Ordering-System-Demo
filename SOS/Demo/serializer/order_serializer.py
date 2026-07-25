from rest_framework import (
    serializers
)
from Demo.models.orders import (
    Order
)

class Order_Serializer(
    serializers.ModelSerializer
):
    CustName = serializers.CharField(
        required=True
    )
    Items = serializers.JSONField(
        required=True
    )
    class Meta:
        model=Order
        fields=[
            "id",
            "CustName",
            "Phone",
            "Items",
            "Total",
            "Car_number",
            "Table_number",
            "Staff",
            "Status",
            "Payment_Status",
            "Payment_Type",
            "created_at"
        ]
        read_only_fields = [
            "id",
            "created_at"
        ]