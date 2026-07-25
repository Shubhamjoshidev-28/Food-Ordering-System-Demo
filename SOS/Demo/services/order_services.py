from Demo.models.orders import (
    Order
)
from Demo.selectors.order_selector import (
    get_order_by_id,
    get_order_by_status
)
from decimal import (
    Decimal
)
from Demo.selectors.menu_seletor import (
    get_menu_by_id
)

class Order_Service :

    @staticmethod
    def build_order_items(
        Items
    ):
         order_items = []
         total = Decimal("0.00")
     
         for item in Items:
     
             menu = get_menu_by_id(item["menu_id"])
     
             qty = item["qty"]
     
             subtotal = menu.ItemPrice * qty
     
             total += subtotal
     
             order_items.append({
                 "menu_id": menu.id,
                 "name": menu.ItemName,
                 "size": menu.ItemQuantity,
                 "unit_price": str(menu.ItemPrice),
                 "qty": qty,
                 "subtotal": str(subtotal),
             })
     
         return order_items, total

    @staticmethod
    def create_order(
        validated_data,
    ):
        Items=validated_data["Items"]
        Items , Total = Order_Service.build_order_items(
            Items
        )
        
        order=Order.objects.create(
            CustName=validated_data['CustName'],
            Phone=validated_data['Phone'],
            Items=Items,
            Total=Total,
            Car_number=validated_data['Car_number'],
            Table_number=validated_data['Table_number'],
            Staff=validated_data['Staff'],
            Payment_Type=validated_data['Payment_Type'],
            Payment_Status=validated_data['Payment_Status']

        )
        
        return order

    @staticmethod
    def get_order(
       status
       
    ):
        if status!="Delivered":
            order=get_order_by_status(status)
        return order

        
    @staticmethod
    def update_order(
        order_id,
        validated_data
    ):
        order=get_order_by_id(order_id)
        if not order:
            return None

        # Only rebuild Items/Total when the client actually sent new Items.
        # This keeps a status-only (or any partial) update from crashing,
        # and makes sure Total always reflects the freshly built Items.
        if "Items" in validated_data:
            Items, Total = Order_Service.build_order_items(
                validated_data["Items"]
            )
            validated_data["Items"] = Items
            validated_data["Total"] = Total

        updated_fields=[]

        for field,value in(
            validated_data.items()
        ):
            setattr(
                order,
                field,
                value
            )
            updated_fields.append(field)
        
        
        order.save(
            update_fields=updated_fields
        )
        return order

    @staticmethod
    def delete_order(order_id):

        order=get_order_by_id(
            order_id
        )

        order.delete()
        return ("Order Removed Successfully")

    @staticmethod
    def order_list():
        return (
            Order.objects.all()
        )

    @staticmethod
    def order_details(
            order_id,
    ):
        order=get_order_by_id(
            order_id
        )

        return (
            {
                "order_id":order.id,
                "Customer_Name":order.CustName,
                "Customer_Number":order.Phone,
                "Order_Items":order.Items,
                "Bill":order.Total,
                "Status":order.Status,
                "Car_number":order.Car_number,
                "Table_number":order.Table_number,
                "Payment_status":order.Payment_Status,
                "Payment_Type":order.Payment_Type,
                "Staff_assigned":order.Staff,
                "Ordered_at":order.created_at

            }
        )