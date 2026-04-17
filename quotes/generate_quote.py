#!/usr/bin/env python3
"""
本事多媒體 — 報價單產生器
用法: python3 generate_quote.py

輸出: quotes/Q001.html, Q002.html, ...
上傳到 GitHub Pages 後，連結格式: https://storychien.github.io/beseen-multimedia/quotes/Q001.html
"""

import json, os, sys
from datetime import datetime, timedelta
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
TEMPLATE = SCRIPT_DIR / "template.html"
QUOTES_DIR = SCRIPT_DIR

def get_next_number():
    existing = sorted(QUOTES_DIR.glob("Q*.html"))
    if not existing:
        return "Q001"
    last = existing[-1].stem
    num = int(last.replace("Q", "")) + 1
    return f"Q{num:03d}"

def format_money(n):
    return f"NT${n:,.0f}"

def generate():
    print("=== 本事多媒體 報價單產生器 ===\n")

    # 基本資訊
    quote_num = get_next_number()
    today = datetime.now().strftime("%Y/%m/%d")
    expiry = (datetime.now() + timedelta(days=30)).strftime("%Y/%m/%d")

    print(f"報價單編號: {quote_num}")
    print(f"日期: {today}")
    print(f"有效期限: {expiry}\n")

    # 客戶資訊
    client_name = input("客戶姓名: ").strip()
    client_company = input("公司名稱 (可留空): ").strip() or "—"
    client_contact = input("聯絡方式 (電話/Email/LINE): ").strip() or "—"

    # 項目
    print("\n新增報價項目 (輸入空白結束):")
    items = []
    while True:
        name = input(f"  項目 {len(items)+1} 名稱 (空白結束): ").strip()
        if not name:
            break
        desc = input(f"  說明: ").strip() or "—"
        qty = input(f"  數量: ").strip()
        qty = int(qty) if qty.isdigit() else 1
        price = input(f"  單價 (NT$): ").strip().replace(",", "")
        price = int(price) if price.isdigit() else 0
        items.append({"name": name, "desc": desc, "qty": qty, "price": price, "total": qty * price})
        print(f"    → {name}: {qty} x {format_money(price)} = {format_money(qty * price)}")

    if not items:
        print("沒有項目，取消。")
        return

    # 稅金
    tax_rate = input("\n稅率 % (預設 0): ").strip()
    tax_rate = float(tax_rate) if tax_rate else 0

    # 備註
    notes = input("備註 (可留空): ").strip() or "1. 請於確認後 3 日內支付 50% 訂金\n2. 尾款於交件時付清\n3. 修改以兩次為限，超出另計"

    # 計算
    subtotal = sum(i["total"] for i in items)
    tax = int(subtotal * tax_rate / 100)
    grand_total = subtotal + tax

    # 生成 HTML
    template = TEMPLATE.read_text(encoding="utf-8")

    items_html = ""
    for i, item in enumerate(items, 1):
        items_html += f"""      <tr>
        <td>{i}</td>
        <td>{item['name']}<br><small style="color:#888">{item['desc']}</small></td>
        <td>{item['qty']}</td>
        <td>{format_money(item['price'])}</td>
        <td>{format_money(item['total'])}</td>
      </tr>
"""

    html = template
    html = html.replace("{{QUOTE_NUMBER}}", quote_num)
    html = html.replace("{{DATE}}", today)
    html = html.replace("{{EXPIRY}}", expiry)
    html = html.replace("{{CLIENT_NAME}}", client_name)
    html = html.replace("{{CLIENT_COMPANY}}", client_company)
    html = html.replace("{{CLIENT_CONTACT}}", client_contact)
    html = html.replace("{{ITEMS}}", items_html)
    html = html.replace("{{SUBTOTAL}}", format_money(subtotal))
    html = html.replace("{{TAX_RATE}}", str(int(tax_rate)))
    html = html.replace("{{TAX}}", format_money(tax))
    html = html.replace("{{TOTAL}}", format_money(grand_total))
    html = html.replace("{{NOTES}}", notes.replace("\n", "<br>"))

    # 輸出
    output = QUOTES_DIR / f"{quote_num}.html"
    output.write_text(html, encoding="utf-8")

    print(f"\n✅ 報價單已生成: {output}")
    print(f"   總金額: {format_money(grand_total)}")
    print(f"\n📤 上傳到 GitHub 後，連結為:")
    print(f"   https://storychien.github.io/beseen-multimedia/quotes/{quote_num}.html")

if __name__ == "__main__":
    generate()
