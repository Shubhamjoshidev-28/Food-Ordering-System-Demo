from rest_framework.views import (
    APIView
)
from Demo.serializer.order_serializer  import (
    Order_Serializer
)
from Demo.selectors.order_selector import (
    get_order,
    get_order_by_id
)
from Demo.services.order_services import (
    Order_Service
)
from rest_framework.response import (
    Response
)
from rest_framework import (
    status
)

class Create_Order_Api(
    APIView
):
    def post(
        self,
        request
    ):
        serializer = Order_Serializer(
            data=request.data
        )

        if serializer.is_valid(
            raise_exception=True
        ):

            order = Order_Service.create_order(
                validated_data=serializer.validated_data
            )

            return Response(
                {
                    "success": True,
                    "message":(
                        "Order Created"
                    ),
                    "order":{
                        "Customer_Name": order.CustName,
                        "Phone":order.Phone,
                        "Car_number":order.Car_number,
                        "Table_number":order.Table_number_number,
                        "Items":order.Items,
                        "Total":order.Total,
                        "Status":order.Status,
                        "Staff":order.Staff,
                        "Payment_status":order.Payment_Status,
                        "Payment_Type":order.Payment_Type
                    }
                },
                status=status.HTTP_201_CREATED
            )

class Update_Order_Api(
    APIView
):
    def patch(
            self,
            order_id,
            request
    ):

        serializer = Order_Serializer(
            data=request.data
        )
        serializer.is_valid(
            partial=True,
            raise_exception=True
        )

        order=Order_Service.update_order(
            order_id=order_id,
            validated_data=serializer.validated_data
        )

        return Response(
                        {
                            "success": True,
                            "message":(
                                "Order Updated"
                            ),
                            "order":{
                                "Customer_Name": order.CustName,
                                "Phone":order.Phone,
                                "Car_number":order.Car_number,
                                "Table_number":order.Table_number_number,
                                "Items":order.Items,
                                "Total":order.Total,
                                "Status":order.Status,
                                "Staff":order.Staff,
                                "Payment_status":order.Payment_Status,
                                "Payment_Type":order.Payment_Type
                            }
                        },
                        status=status.HTTP_201_CREATED
                    )

class Order_List_Api(
    APIView
):
    def get(
            self,
            request
    ):
        order = get_order()
        return order

class Order_Detail_Api(
    APIView
):
    def get(
            self,
            order_id,
            request
    ):
        order= Order_Service.order_details(
            order_id
        )

        return order

class Delete_Order_Api(
    APIView
):
    def delete(
        self,
        order_id,
        request
    ):
        order = Order_Service.delete_order(
            order_id
        )
        return order