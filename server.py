import socket
import threading
import sqlite3
from datetime import datetime

HOST = '127.0.0.1'
PORT = 5000

clients = {}  # username -> socket

# ---------- DATABASE ----------
def init_db():
    conn = sqlite3.connect("chat.db")
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT,
            receiver TEXT,
            text TEXT,
            time TEXT
        )
    ''')

    conn.commit()
    conn.close()

init_db()

def save_message(sender, receiver, text):
    conn = sqlite3.connect("chat.db")
    c = conn.cursor()

    c.execute('''
        INSERT INTO messages (sender, receiver, text, time)
        VALUES (?, ?, ?, ?)
    ''', (sender, receiver, text, datetime.now().strftime("%H:%M:%S")))

    conn.commit()
    conn.close()

# ---------- HANDLE CLIENT ----------
def handle_client(client):
    username = client.recv(1024).decode()
    clients[username] = client

    print(f"{username} connected")

    while True:
        try:
            msg = client.recv(1024).decode()
            if msg:
                sender, receiver, text = msg.split("|", 2)

                save_message(sender, receiver, text)

                if receiver in clients:
                    clients[receiver].send(msg.encode())
                client.send(msg.encode())  # echo back to sender
        except:
            print(f"{username} disconnected")
            del clients[username]
            client.close()
            break

# ---------- START SERVER ----------
def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen()

    print("Server started...")

    while True:
        client, addr = server.accept()
        thread = threading.Thread(target=handle_client, args=(client,))
        thread.start()

start_server()