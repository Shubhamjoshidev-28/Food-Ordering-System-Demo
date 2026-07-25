from rest_framework.views import (
    APIView
)
from Demo.serializer.order_serializer  import (
    Order_Serializer
)
from Demo.selectors.order_selector import (
    get_order
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
                        "id": order.id,
                        "Customer_Name": order.CustName,
                        "Phone":order.Phone,
                        "Car_number":order.Car_number,
                        "Table_number":order.Table_number,
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
            request,
            order_id
    ):

        serializer = Order_Serializer(
            data=request.data,
            partial=True
        )
        serializer.is_valid(
            raise_exception=True
        )

        order=Order_Service.update_order(
            order_id,
            validated_data=serializer.validated_data
        )

        return Response(
                        {
                            "success": True,
                            "message":(
                                "Order Updated"
                            ),
                            "order":{
                                "id": order.id,
                                "Customer_Name": order.CustName,
                                "Phone":order.Phone,
                                "Car_number":order.Car_number,
                                "Table_number":order.Table_number,
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
        return Response (
            {
                "success":True,
                "message":"Order Fetch Successfully",
                "order": Order_Serializer(order, many=True).data
            },
            status=status.HTTP_200_OK
        )
            

class Order_Detail_Api(
    APIView
):
    def get(
            self,
            request,
            order_id,
    ):
        order= Order_Service.order_details(
            order_id
        )

        return Response (
            {
                "success":True,
                "message":"Order Detail Fetched Successfully",
                "order_details": order
            },
            status=status.HTTP_200_OK
        )

class Delete_Order_Api(
    APIView
):
    def delete(
        self,
        request,
        order_id
    ):
        order = Order_Service.delete_order(
            order_id
        )
        return Response (
            {
                "success":True,
                "message":"Order Deleted Successfully",
                "order":order
            },
            status = status.HTTP_200_OK
        )