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

urlpatterns=[
    path('create/',Create_Order_Api.as_view(),name='create_order'),
    path('update/<int:id>',Update_Order_Api.as_view(),name='update_order'),
    path('details/<int:id>',Order_Detail_Api.as_view(),name='details_order'),
    path('list/',Order_List_Api.as_view(),name='list_order'),
    path('delete/<init:id>',Delete_Order_Api.as_view(),name='delete_order'),
]