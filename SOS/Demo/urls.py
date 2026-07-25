from django.urls import (
    path
)
from Demo.views.order_views import (
    Create_Order_Api,
    Delete_Order_Api,
    Order_Detail_Api,
    Order_List_Api,
    Update_Order_Api
)
from Demo.views.menu_views import (
    Create_menu_item,
    Edit_menu_item,
    Delete_menu_item,
    Menu_list_item
)
from Demo.views.invoice_views import (
    generate_invoice
)

urlpatterns=[
    path('create_order/',Create_Order_Api.as_view(),name='create_order'),
    path('update_order/<int:order_id>/',Update_Order_Api.as_view(),name='update_order'),
    path('order_details/<int:order_id>/',Order_Detail_Api.as_view(),name='details_order'),
    path('order_list/',Order_List_Api.as_view(),name='list_order'),
    path('delete_order/<int:order_id>/',Delete_Order_Api.as_view(),name='delete_order'),

    path('create_item/',Create_menu_item.as_view(),name='create_menu'),
    path('menu_list/',Menu_list_item.as_view(),name='list_menu'),
    path('update_menu/<int:item_id>/',Edit_menu_item.as_view(),name='update_menu'),
    path('delete_menu/<int:item_id>/',Delete_menu_item.as_view(),name='delete_menu'),

    path('generate_invoice/<int:order_id>/',generate_invoice,name="generate_bill")
]