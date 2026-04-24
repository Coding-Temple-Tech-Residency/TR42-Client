import socket
import threading
import tkinter as tk
from tkinter import simpledialog, scrolledtext

HOST = '127.0.0.1'
PORT = 5000

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect((HOST, PORT))

# ---------- USERNAME ----------
root = tk.Tk()
root.title("Vendor Messaging App")

username = simpledialog.askstring("Username", "Enter your name:", parent=root)
client.send(username.encode())

selected_vendor = None

# ---------- UI LAYOUT ----------
frame = tk.Frame(root)
frame.pack()

# Vendor list
vendor_frame = tk.Frame(frame)
vendor_frame.pack(side="left", padx=10)

tk.Label(vendor_frame, text="Vendors").pack()

vendors = ["VendorA", "VendorB", "VendorC"]

vendor_listbox = tk.Listbox(vendor_frame)
vendor_listbox.pack()

for v in vendors:
    if v != username:
        vendor_listbox.insert(tk.END, v)

# Chat area
chat_frame = tk.Frame(frame)
chat_frame.pack(side="right")

chat_area = scrolledtext.ScrolledText(chat_frame, width=50, height=20)
chat_area.pack()
chat_area.config(state='disabled')

msg_entry = tk.Entry(chat_frame, width=40)
msg_entry.pack(side="left")

# ---------- SELECT VENDOR ----------
def select_vendor(event):
    global selected_vendor
    selection = vendor_listbox.curselection()
    if selection:
        selected_vendor = vendor_listbox.get(selection[0])
        chat_area.config(state='normal')
        chat_area.delete(1.0, tk.END)
        chat_area.insert(tk.END, f"Chatting with {selected_vendor}\n")
        chat_area.config(state='disabled')

vendor_listbox.bind("<<ListboxSelect>>", select_vendor)

# ---------- SEND ----------
def send_message():
    if selected_vendor:
        msg = msg_entry.get()
        if msg:
            full_msg = f"{username}|{selected_vendor}|{msg}"
            client.send(full_msg.encode())
            msg_entry.delete(0, tk.END)

send_btn = tk.Button(chat_frame, text="Send", command=send_message)
send_btn.pack(side="right")

msg_entry.bind("<Return>", lambda event: send_message())

# ---------- RECEIVE ----------
def receive_messages():
    while True:
        try:
            msg = client.recv(1024).decode()
            sender, receiver, text = msg.split("|", 2)

            if sender == selected_vendor or receiver == selected_vendor:
                chat_area.config(state='normal')
                chat_area.insert(tk.END, f"{sender}: {text}\n")
                chat_area.config(state='disabled')
                chat_area.yview(tk.END)
        except:
            break

thread = threading.Thread(target=receive_messages)
thread.start()

root.mainloop()