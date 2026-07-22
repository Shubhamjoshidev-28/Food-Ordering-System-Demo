from django.db import models

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

    OrderID = models.BigAutoField(
        primary_key=True,
        unique=True
    )

    CustName = models.CharField(
        max_length=100
    )

    Phone = models.BigIntegerField(
        max_length=10
    )

    Items= models.JSONField(
        default=list,
        blank=True
    )

    Total = models.BigAutoField(
        null=True,
        blank=True
    )

    Car_number = models.CharField(
        null=True,
        blank=True
    )

    Table_number = models.BigAutoField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES
    )

    Staff = models.CharField(
        null=True,
        Blank=True
    )
    
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES
    )
    