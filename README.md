# Password Generator

**Password Generator** is a cross-platform desktop application built with React, Electron, and Vite. It securely generates passwords based on user-selected options and integrates with the 1Password CLI to save passwords.

---

<img width="458" alt="Screenshot 2025-02-20 at 5 41 46 PM" src="https://github.com/user-attachments/assets/b29c38fc-d907-43d9-8c38-abd1a2340c43" />

---

## Features

- **Generate secure passwords** with customizable options such as length and character types (uppercase, lowercase, numbers, and symbols).
- **Copy passwords** to the clipboard.
- **Save passwords** directly to 1Password via CLI integration.
- Built using modern technologies: **React, Electron, Vite,** and **TailwindCSS**.

## Requirements

Before you begin, ensure you have installed:
- Node.js (v16 or later) and npm
- Git
- 1Password CLI

## Install Requirements

Install Node.js (v16 or later) and npm:
```brew install node```

Install Git:
```brew install git```

Install 1Password CLI:
```brew install –cask 1password/tap/1password-cli```

## Installation

Clone the repository:

```git clone https://github.com/your-username/your-repo.git```
```cd your-repo```

Install dependencies:

```npm install```

## Development

To run the application in development mode with live reload support, use:

```npm run electron:dev```

This launches the Vite development server and opens the app in an Electron window.

## Packaging

To build and package the application into a standalone executable, use:

```npm run electron:build```

The packaged application will be available in the release folder.

- For the packaged app, open the executable found in the release folder.

**Generating a Password**

- Adjust the password criteria (length, uppercase, lowercase, numbers, symbols) in the app's interface.
- Click the **Generate New** button to create a secure password.
- Click **Copy** to copy the password to your clipboard.
- Click **Save to 1Password** to save the password via the integrated 1Password CLI.

## Troubleshooting

- **1Password CLI Issues:**  
If the application reports that the 1Password CLI is not found, verify that it is installed and accessible in your environment. In packaged applications, ensure that common installation paths (such as /usr/local/bin or /opt/homebrew/bin) are included in your PATH.

- **Git and Repository Issues:**  
Ensure your local repository is correctly linked to your remote if you encounter synchronization problems.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
