from Demo.models.menu import (
    Menu
)
from Demo.selectors.menu_seletor import (
    get_menu_by_id,
    get_menu_items
)

class Menu_Service:

    @staticmethod
    def add_menu_item(
        validated_data,
    ):
        MenuItem=Menu.objects.create(
            ItemName=validated_data['ItemName'],
            ItemQuantity=validated_data['ItemQuantity'],
            ItemPrice=validated_data['ItemPrice']
        )

        return MenuItem

    @staticmethod
    def edit_menu_item(
        item_id,
        validated_data
    ):
        menu=get_menu_by_id(
            item_id
        )
        if not menu:
            return None

        updated_fields=[]

        for field,value in (
            validated_data.items()
        ):
            setattr(
                menu,
                field,
                value
            )
            updated_fields.append(field)

        menu.save(
            update_fields=updated_fields
        )
        return menu

    @staticmethod
    def get_menu(

    ):
        menu=get_menu_items()
        return menu

    def delete_menu_item(
            menu_id
    ):
        menu=get_menu_by_id(
            menu_id
        )

        menu.delete()

        return ("Item Removed Successfully")