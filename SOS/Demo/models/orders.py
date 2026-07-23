from django.db import (
    models
)

from django.core.validators import (
    MinValueValidator
)

from decimal import (
    Decimal
)

class Order(models.Model):
    STATUS_CHOICES=(
        ("Preparing","preparing"),
        ("Accepted","accepted"),
        ("Ready To Collect","ready to collect"),
        ("Delivered","delivered")
    )
    PAYMENT_STATUS_CHOICES=(
        ("Pending","pending"),
        ("Paid","paid")
    )
    PAYMENT_TYPE=(
        ("Online","online"),
        ("Offline","offline")
    )

    CustName = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    Phone = models.CharField(
        max_length=15,
        null=True,
        blank=True
    )

    Items= models.JSONField(
        default=list,
        blank=True,
        null=True
    )

    Total = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        null=True,
        blank=True
    )

    Car_number = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    Table_number = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    Status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Preparing'
    )

    Staff = models.CharField(
        null=True,
        blank=True
    )
    
    Payment_Status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        blank=True,
        null=True
    )

    Payment_Type = models.CharField(
        max_length=10,
        choices=PAYMENT_TYPE,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Order #{self.id}"
    