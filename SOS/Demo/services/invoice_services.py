from Demo.selectors.order_selector import get_order_by_id


class Invoice_Service:

    @staticmethod
    def generate_bill(order_id):

        order = get_order_by_id(order_id)

        invoice = {
            "invoice_number": f"INV-{order.id:05d}",

            "customer": {
                "name": order.CustName,
                "phone": order.Phone,
                "car_number": order.Car_number,
                "table_number": order.Table_number,
            },

            "items": order.Items,

            "total": order.Total,

            "order": {
                "status": order.Status,
                "staff": order.Staff,
                "payment_status": order.Payment_Status,
                "payment_type": order.Payment_Type,
                "created_at": order.created_at,
            }
        }

        return invoice