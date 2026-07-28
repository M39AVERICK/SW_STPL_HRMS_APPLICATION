from openpyxl import Workbook

def generate_excel(po):
    wb = Workbook()
    ws = wb.active
    ws.title = "PO Report"

    ws.append(["Vendor", po.vendor.name])
    ws.append(["Customer", po.customer.name])
    ws.append(["Date", str(po.date)])
    ws.append([])

    ws.append(["Resource", "Rate", "Hours", "Amount"])

    for r in po.resources.all():
        ws.append([
            r.name,
            r.rate,
            r.hours,
            r.rate * r.hours
        ])

    ws.append([])
    ws.append(["Subtotal", po.subtotal])
    ws.append(["GST", po.gst])
    ws.append(["TDS", po.tds])
    ws.append(["Total", po.total])

    return wb