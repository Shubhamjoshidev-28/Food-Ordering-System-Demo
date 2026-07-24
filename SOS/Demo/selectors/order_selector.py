from Demo.models.orders import (
    Order
)

def get_order_by_id(
        order_id
):
    return (
        Order.objects
        .get(id=order_id)
    )

def get_order_by_status(
        status
):
    return (
        Order.objects
        .filter(
            status=status
        )
    )

def get_order(
        
):
    return (
        Order.objects.all()
    )
