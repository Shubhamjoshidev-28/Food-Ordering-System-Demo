from Demo.models.menu import (
    Menu
)

def get_menu_items(
        
):
    return (
        Menu.objects.all()
    )

def get_menu_by_id(
        menu_id
):
    return (
        Menu.objects
        .get(id=menu_id)
    )