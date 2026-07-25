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
            "id",
            "ItemName",
            "ItemQuantity",
            "ItemPrice"
        ]
        read_only_fields = [
            "id"
        ]