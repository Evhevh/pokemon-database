# ⚡ Pokémon Database Manager & Team Builder

A powerful web application and database solution designed to streamline the process of Pokémon team building, leveraging an extensive database with approximately **100,000 entries**.


---

## ✨ Features

* **Extensive Database:** An extensive database containing a large volume of Pokémon data (approx. 100k entries) for comprehensive team planning.
* **WebUI Team Builder:** A user-friendly web interface that allows users to search, filter, and select Pokémon to build and manage their perfect teams.
* **Fuzzy Searching:** Implements advanced search capabilities (using `COALESCE` and fuzzy finding syntax) to quickly locate Pokémon even with minor spelling variations.
* **Database Management:** Includes SQL files for easy setup, backup, and management of the Pokémon dataset.

---

## 🛠️ Technologies Used

This project is built using a modern full-stack approach centered around JavaScript and a relational database.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | **Node.js & Express.js** | Handling server logic, routing, and API endpoints. |
| **Frontend** | **Handlebars.js** | Templating engine for dynamic HTML rendering in the `views`. |
| **Database** | **SQL (e.g., MySQL/PostgreSQL)** | Stores all Pokémon data; management scripts are provided in `sql_files`. |
| **Styling** | **CSS** | Defines the application's look and feel (`public` directory). |

---

## 🚀 Getting Started

Follow these steps to get a copy of the project up and running on your local machine.

### Prerequisites

You will need the following installed:

1.  **Node.js** (LTS version recommended)
2.  A local **SQL Server** (e.g., MySQL, PostgreSQL)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Evhevh/pokemon-database.git](https://github.com/Evhevh/pokemon-database.git)
    cd pokemon-database
    ```
2.  **Install Node dependencies:**
    ```bash
    npm install
    ```
3.  **Database Setup:**
    * Create a new database instance (e.g., `pokemon_db`).
    * Import the database structure and data using the provided backup file:
        ```bash
        # Example command (may vary based on your SQL tool)
        mysql -u [USER] -p pokemon_db < project_backup.sql
        ```
    * Configure your database connection details in a separate file (e.g., a `.env` file or within the `database` folder connection script).
4.  **Run the application:**
    ```bash
    node app.js
    ```
    The application should now be running, typically accessible at `http://localhost:3000`.

---

## 🤝 Citations and Acknowledgments

This project utilized AI assistance for specific, complex SQL implementations:

* AI was used to find the correct **`SET`** and **`COALESCE`** syntax for conditional creation and data handling.
* AI was used to implement the **syntax for fuzzy finding** functionality to improve search quality.

---

## 📞 Contact

* **GitHub:** [@Evhevh](https://github.com/Evhevh)
* **Project Link:** [https://github.com/Evhevh/pokemon-database](https://github.com/Evhevh/pokemon-database)
