import os
import zipfile

project = "TravelAutomationFramework_Playwright_Python"

files = {

"requirements.txt":
"""playwright
pytest
pytest-html
openpyxl
""",

"pytest.ini":
"""[pytest]
testpaths=tests
addopts=-v
""",

"conftest.py":
"""import pytest
from playwright.sync_api import sync_playwright


@pytest.fixture
def page():

    with sync_playwright() as p:

        browser=p.chromium.launch(headless=False)

        page=browser.new_page()

        yield page

        browser.close()
""",

"config/qa.json":
"""{
"base_url":"https://example.com"
}""",

"config/dev.json":
"""{
"base_url":"https://dev.example.com"
}""",

"config/preprod.json":
"""{
"base_url":"https://preprod.example.com"
}""",

"pages/login_page.py":
"""class LoginPage:

    def __init__(self,page):
        self.page=page

    def open(self,url):
        self.page.goto(url)

    def login(self,user,password):
        self.page.fill("#username",user)
        self.page.fill("#password",password)
        self.page.click("#login")
""",

"pages/flight_search_page.py":
"""class FlightSearchPage:

    def __init__(self,page):
        self.page=page

    def search(self,from_city,to_city):
        self.page.fill("#from",from_city)
        self.page.fill("#to",to_city)
        self.page.click("#search")
""",

"pages/hotel_search_page.py":
"""class HotelSearchPage:

    def __init__(self,page):
        self.page=page

    def search(self,city):
        self.page.fill("#city",city)
        self.page.click("#searchHotel")
""",

"utilities/excel_reader.py":
"""from openpyxl import load_workbook


class ExcelReader:

    def read(self,file,sheet):

        wb=load_workbook(file)

        ws=wb[sheet]

        return [
        row for row in ws.iter_rows(values_only=True)
        ]
""",

"utilities/excel_writer.py":
"""from openpyxl import load_workbook


class ExcelWriter:

    def write(self,file,sheet,row,value):

        wb=load_workbook(file)

        ws=wb[sheet]

        ws.cell(row,3).value=value

        wb.save(file)
""",

"utilities/config_reader.py":
"""import json


def get_config(file):

    with open(file) as f:
        return json.load(f)
""",

"utilities/logger.py":
"""import logging

logging.basicConfig(
filename='automation.log',
level=logging.INFO
)

logger=logging.getLogger()
""",

"tests/test_login.py":
"""from pages.login_page import LoginPage


def test_login(page):

    login=LoginPage(page)

    login.open(
    "https://example.com"
    )

    login.login(
    "user",
    "password"
    )

    assert True
""",

"tests/test_flight_booking.py":
"""def test_flight_booking():

    assert True
""",

"tests/test_hotel_booking.py":
"""def test_hotel_booking():

    assert True
"""
}


for path,content in files.items():

    full=os.path.join(project,path)

    os.makedirs(
        os.path.dirname(full),
        exist_ok=True
    )

    with open(full,"w") as f:
        f.write(content)


with zipfile.ZipFile(
    project+".zip",
    "w"
) as zipf:

    for root,dirs,fs in os.walk(project):

        for file in fs:

            full=os.path.join(root,file)

            zipf.write(full)


print(
f"Created {project}.zip"
)