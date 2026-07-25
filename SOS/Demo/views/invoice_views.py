from django.shortcuts import render

from Demo.services.invoice_services import Invoice_Service


def generate_invoice(
        request, 
        order_id
):

    invoice = Invoice_Service.generate_bill(
        order_id=order_id
    )

    return render(
        request,
        "invoice.html",
        {
            "invoice": invoice
        }
    )