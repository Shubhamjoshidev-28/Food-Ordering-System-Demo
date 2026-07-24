from rest_framework.views import (
    APIView
)
from Demo.services.menu_services import (
    Menu_Service
)
from Demo.serializer.menu_serializers import (
    Menu_Serializer
)
from rest_framework.response import (
    Response
)
from rest_framework import (
    status
)

class Create_menu_item(
    APIView
):

    def post(
        self,
        request
    ):

        serializer = Menu_Serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        Menu = Menu_Service.add_menu_item(
            validated_data=serializer.validated_data
        )

        return Response (
            {
                "success": True,
                "message":"Menu Item Created successfully",
                "menu_item": Menu_Serializer(Menu).data
            },
            status=status.HTTP_201_CREATED
        )

class Edit_menu_item(
    APIView
):
    def patch(
            self,
            request,
            item_id
    ):
        serializer = Menu_Serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        menu=Menu_Service.edit_menu_item(
            item_id,
            validated_data=serializer.validated_data
        )

        if menu is None:
            return Response (
                {
                    "success": False,
                    "message": f"Menu item with id {item_id} does not exist."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response (
            {
                "success":True,
                "message":"Menu Item Edited successfully",
                "menu_item": Menu_Serializer(menu).data
            },
            status=status.HTTP_200_OK
        )
        

class Delete_menu_item(
    APIView
):
    def delete(
            self,
            request,
            item_id
    ):
        Menu = Menu_Service.delete_menu_item(
                item_id
        )

        if Menu is None:
            return Response (
                {
                    "success": False,
                    "message": f"Menu item with id {item_id} does not exist."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response (
            {
                "success":True,
                "message": Menu
            },
            status=status.HTTP_200_OK
        )

class Menu_list_item(
    APIView
):
    def get(
        self,
        request
    ):
        Menu = Menu_Service.get_menu()
        return Response (
            {
                "success":True,
                "message":"Menu fetched Successfully",
                "menu_items": Menu_Serializer(Menu, many=True).data
            },
            status=status.HTTP_200_OK
        )