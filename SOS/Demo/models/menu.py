from django.db import models

from django.core.validators import MinValueValidator
from decimal import Decimal

class Menu(models.Model):

    QUANTITY_CHOICES=(
        ("Half","half"),
        ("Full","full")
    )

    ItemName = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    ItemQuantity = models.CharField(
        max_length = 20,
        choices=QUANTITY_CHOICES,
        null=True,
        blank=True
    )

    ItemPrice = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.ItemName
