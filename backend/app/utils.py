from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
USER_DBS_DIR = ROOT / "user_dbs"
USER_DBS_DIR.mkdir(exist_ok=True)

def ensure_user_db(username: str) -> str:
    """Ensures user-specific DB exists and has sample tables + demo data."""
    db_path = USER_DBS_DIR / f"{username}.db"
    if not db_path.exists():
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        # Create sample tables
        cur.executescript("""
        CREATE TABLE IF NOT EXISTS Customers (
            customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            age INTEGER,
            country TEXT
        );

        CREATE TABLE IF NOT EXISTS Orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            order_date TEXT,
            amount REAL,
            FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
        );

        CREATE TABLE IF NOT EXISTS Shippings (
            shipping_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            address TEXT,
            status TEXT,
            FOREIGN KEY (order_id) REFERENCES Orders(order_id)
        );
        """)

        # Sample customers
        customers = [
            ("John", "Doe", 30, "USA"),
            ("Robert", "Smith", 40, "UK"),
            ("Alice", "Brown", 28, "India"),
            ("Maria", "Gonzalez", 35, "Spain"),
            ("Wei", "Zhang", 45, "China"),
            ("Aisha", "Khan", 32, "UAE"),
            ("Carlos", "Mendez", 27, "Mexico"),
            ("Olivia", "Johnson", 29, "Canada"),
            ("David", "Lee", 38, "South Korea"),
            ("Sophia", "Andersson", 33, "Sweden")
        ]
        cur.executemany("INSERT INTO Customers (first_name, last_name, age, country) VALUES (?, ?, ?, ?)", customers)

        # Sample orders
        orders = [
            (1, "2024-04-01", 250.75),
            (2, "2024-04-03", 120.00),
            (3, "2024-04-05", 500.00),
            (4, "2024-04-06", 90.25),
            (5, "2024-04-07", 310.60),
            (6, "2024-04-08", 200.10),
            (7, "2024-04-09", 650.00),
            (8, "2024-04-10", 75.50),
            (9, "2024-04-11", 480.30),
            (10, "2024-04-12", 1000.00)
        ]
        cur.executemany("INSERT INTO Orders (customer_id, order_date, amount) VALUES (?, ?, ?)", orders)

        # Sample shipping info
        shippings = [
            (1, "123 Main St, NY", "Delivered"),
            (2, "10 Downing St, London", "Shipped"),
            (3, "MG Road, Bangalore", "Processing"),
            (4, "Plaza Mayor, Madrid", "Delivered"),
            (5, "Beijing Road, Guangzhou", "Pending"),
            (6, "Downtown Dubai", "Delivered"),
            (7, "Av. Reforma, Mexico City", "Processing"),
            (8, "Bay Street, Toronto", "Shipped"),
            (9, "Gangnam-daero, Seoul", "Delivered"),
            (10, "Vasagatan, Stockholm", "Delivered")
        ]
        cur.executemany("INSERT INTO Shippings (order_id, address, status) VALUES (?, ?, ?)", shippings)

        conn.commit()
        conn.close()

    return str(db_path)
