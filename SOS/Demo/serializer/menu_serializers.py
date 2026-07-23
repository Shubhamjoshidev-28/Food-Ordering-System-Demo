from rest_framework import (
    serializers
)
from Demo.models.menu import (
    Menu
)

class Menu_Serializer(
    serializers.ModelSerializer
):
    class Meta:
        model=Menu
        fields=[
            "ItemName",
            "ItemQuantity",
            "ItemPrice"
        ]