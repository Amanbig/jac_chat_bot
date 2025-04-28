# NDMC Chat Bot

A conversational AI assistant designed to provide guidance about New Delhi Municipal Council (NDMC), built with Next.js and modern web technologies.

![NDMC Chat Bot](./public/bot-avatar.png)

## 🌟 Features

- **Interactive Chat Interface**: Engage in natural conversations about NDMC
- **PDF Knowledge Base**: Answers questions based on official NDMC brochures and documents
- **Source Citations**: Provides references to source documents with page numbers
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with animations and typing effects

## 🛠️ Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Animations**: Framer Motion
- **Markdown Rendering**: React Markdown with remark-gfm
- **Notifications**: Sonner toast notifications
- **API Communication**: Fetch API with local backend server

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Backend server running on http://localhost:8000 (not included in this repository)

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Amanbig/jac_chat_bot
cd jac_chat_bot

# Install dependencies
npm install
```

### Development

```bash
# Run the development server with Turbo
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📝 Usage

1. Open the application in your browser
2. Type your question about NDMC  in the input field
3. Press Enter or click the send button
4. View the bot's response with relevant information and sources
5. Continue the conversation as needed

## 📚 Project Structure

```
├── public/            # Static assets and PDF documents
│   ├── pdfs/          # NDMC brochures and information documents
│   └── ...            # Other static assets
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/     # React components
│   │   ├── app/       # Application-specific components
│   │   └── ui/        # Reusable UI components
│   ├── lib/           # Utility functions and API clients
│   └── types/         # TypeScript type definitions
└── ...                # Configuration files
```
## 🤝 Contributing
Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for details on how to submit pull requests.  

## 📄 License

[MIT](LICENSE)

