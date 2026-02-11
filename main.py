import customtkinter as ctk
from database import init_db
from ui.login import LoginWindow
# We will import Dashboard later when we handle the transition

def main():
    ctk.set_appearance_mode("System")  # Modes: "System" (standard), "Dark", "Light"
    ctk.set_default_color_theme("blue")  # Themes: "blue" (standard), "green", "dark-blue"
    
    # Initialize Database
    init_db()
    
    app = LoginWindow()
    app.mainloop()

if __name__ == "__main__":
    main()
