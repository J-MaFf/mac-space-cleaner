# Mac Space Cleaner

Mac Space Cleaner is a utility application designed to help users identify and delete unnecessary files on their Mac to free up disk space. This project scans the file system, analyzes file metadata, and suggests files that can be safely removed.

## Features

- Scans the file system for files and directories.
- Analyzes files based on size, type, and last accessed date.
- Generates a user-friendly report of suggested files for deletion.
- Provides utility functions for reading and deleting files.

## Project Structure

```
mac-space-cleaner
├── src
│   ├── main.ts          # Entry point of the application
│   ├── scanner.ts       # Scanning functionality
│   ├── analyzer.ts      # File analysis and reporting
│   ├── types
│   │   └── index.ts     # Type definitions
│   └── utils
│       └── fileUtils.ts # Utility functions for file operations
├── package.json         # NPM configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mac-space-cleaner.git
   ```
2. Navigate to the project directory:
   ```
   cd mac-space-cleaner
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To run the application, execute the following command:
```
npm start
```

The application will initiate a scan of your Mac's file system and provide suggestions for files that can be deleted to free up space.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.