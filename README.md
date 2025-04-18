# Quantuma Dev Project

Welcome to the Quantuma development project. This project uses Vite for the front-end framework and is containerized with Docker to ensure a consistent development environment.

## Prerequisites

Before you start, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Remote - Containers extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Getting Started

Follow these steps to get your development environment running:

1. **Clone the Repository**
    ```
    git clone https://github.com/adnan-quantuma/develop.git
    ```

2. **Open in Visual Studio Code**
    - Open Visual Studio Code.
    - Navigate to `File > Open Folder...` and select the cloned directory.
    - VS Code might prompt you to reopen the project in a container. If it doesn't, open the command palette and type "Dev Containers: Open workspace in container " for .

3. **Start the Development Server**
    - Navigate to the frontend folder and start the development server by running:
        ```
        cd frontend 
        npm run dev
        ```
    - This command compiles the app and hot-reloads for development. 

## Project Structure

- **`.devcontainer`**: Contains Docker configuration files for the development environment.
- **`backend`**: Placeholder directory for backend services.
- **`frontend`**: Contains the source code for the front-end application.
    - **`src`**: Source files for the app, including components and styles.
    - **`components`**: React components used throughout the app.

---

Thank you for contributing to the Quantuma project. Let's build something great together!
